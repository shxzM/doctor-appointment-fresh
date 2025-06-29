import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import razorpay from 'razorpay'

//API to register user

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing details" })
        }

        if(!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid email" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters long" })
        }

        //Hashing the user's password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword

        }

        const newUser = new userModel(userData)
        const user = await newUser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.json({success: true, token})

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

//API for user login
const loginUser = async (req, res)=>{
    try {
        const {email, password} = req.body
        const user = await userModel.findOne({email})

        if (!user) {
            return res.json({ success: false, message: 'User does not exist' });
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
            res.json({success: true, token})
        }else{
            res.json({success: false, message: "Invalid credentials"})
        }

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

//API to get user profile data

const getProfile = async (req, res)=>{
    try {
        
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({success:true, userData})

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

//API to update user profile data
const updateProfile = async (req, res)=>{
    try {
        const {userId, name, phone, address, dob, gender} = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Missing details" })
            
        }

        await userModel.findByIdAndUpdate(userId, {name, phone, address: JSON.parse(address), dob, gender})

        if (imageFile) {
            //Upload the image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:'image'})
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, {image: imageURL})
        }

        res.json({success: true, message: "Profile updated"})

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

//API to book appointment
const bookAppointment = async (req, res) =>{
    try {
        
        const {userId, docId, slotDate, slotTime } = req.body

        const docData = await doctorModel.findById(docId).select('-password')

        if(!docData.available){
            return res.json({ success: false, message: "Doctor is not available" })
        }

        let slots_booked = docData.slots_booked

        // Check if the slot is available
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: "Slot not available" })
            }else{
                slots_booked[slotDate].push(slotTime)
            }
        }else{
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppoitnment = new appointmentModel(appointmentData)
        await newAppoitnment.save()

        //Save new slots data in doctor's data
        await doctorModel.findByIdAndUpdate(docId, {slots_booked})

        res.json({success: true, message:'Appointment booked'})

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

//API to get all appointments of a user
const listAppointment = async (req, res) => {
    try {
        
        const {userId} = req.body
        const appointments = await appointmentModel.find({userId})
        
        res.json({ success: true, appointments });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}


//API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const {userId, appointmentId} = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        //Verify if the appointment belongs to the user
        if(appointmentData.userId !== userId) {
            return res.json({ success: false, message: "You cannot cancel this appointment" });
        }

        //Remove the appointment from the database
        await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled: true});

        //Releasing slot of the doctor
        const {docId, slotDate, slotTime} = appointmentData
        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(slot => slot !== slotTime);

        await doctorModel.findByIdAndUpdate(docId, {slots_booked});

        res.json({ success: true, message: "Appointment cancelled" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

const razorPayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})


//API to make payments using razorpay
const paymentRazorPay = async(req, res)=>{

    try {
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({success: false, message: "Appointment cancelled or not found"})
        }

        // Creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId
        }

        //Creation of an order
        const order = await razorPayInstance.orders.create(options)

        res.json({success: true, order})


    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }

}
    
//API to verify payment of Razorpay

const verifyRazorPay = async (req, res)=>{
    try {
        const { razorpay_order_id} = req.body
        const orderInfo = await razorPayInstance.orders.fetch(razorpay_order_id)

        // console.log(orderInfo)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {payment: true})
            res.json({success: true, message: 'Payment Successful'})
        } else{
            res.json({success: false, message: 'Payment Failed'})
        }


    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorPay, verifyRazorPay }