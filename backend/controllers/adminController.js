import validator from 'validator';
import bcrypt from 'bcrypt';
import { v2 as cloudinary} from 'cloudinary'
import doctorModel from "../models/doctorModel.js"
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js';

//API for adding doctor

const addDoctor = async(req, res)=>{

    try {

        const { name, email, password, specialty, degree, experience, about, fees, address } = req.body
        const imageFile = req.file

        // console.log({ name, email, password, specialty, degree, experience, about, fees, address }, imageFile );
        
        //Checking for all data to add doctor
        if (!name || !email || !password || !specialty || !degree || !fees || !experience || !about || !address) {
            return res.json({success: false, message: "Missing details"})
        }

        //Validating email format
        if (!validator.isEmail(email)) {
            return res.json({success: false, message: "Enter a valid email"})
        }
        
        if (password.length < 8) {
            return res.json({success: false, message: "Enter a valid password"})
        }

        //Hashing the doctor's password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //Uploading image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:"image"})
        const imageUrl = imageUpload.secure_url;

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            specialty,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        res.json({success: true, message:"Doctor added"})

    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API for admin login
const adminLogin = async(req, res) =>{
    try {
        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password, process.env.JWT_SECRET)
            return res.json({success: true, message: "Admin logged in successfully", token})
        }
        else {
            return res.json({success: false, message: "Invalid credentials"})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}


//API to get all the doctors in the database for admin panel
const allDoctors = async (req, res)=>{
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({success: true, doctors})

    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})     
    }
}

//API to get all appointments list
const appointmentsAdmin = async(req, res)=>{
    try {
        
        const appointments = await appointmentModel.find({})
        res.json({success:true, appointments})

    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {
        const {appointmentId} = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)


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




export {addDoctor, adminLogin, allDoctors, appointmentsAdmin, appointmentCancel}