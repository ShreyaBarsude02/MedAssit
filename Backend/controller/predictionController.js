import { validationResult } from "express-validator";
import fetch from "node-fetch"
import doctor_vs_disease from "../disease_data/doctor_vs_disease.json"
import Doctor from "../models/doctorModel.js";
import diseaseInfo from "../disease_data/disease_info.json"

export const predictDisease = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const features = req.body;

  try {
    const response = await fetch("http://127.0.0.1:5000/predictdisease", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features),
    });

    const data = await response.json();
    const disease = data.predicted_disease

    const doctor = doctor_vs_disease[disease]

    const enrolledDoctor = await Doctor.findOne({ specialization: doctor });

    const disease_info = diseaseInfo[disease]

    if(!doctor){
        enrolledDoctor = []
    }

    res.status(200).json({ disease, doctor, enrolledDoctor, disease_info });
    console.log("Disease", disease);
    console.log("Doctor", doctor);
    console.log("Enrolled Doctor", enrolledDoctor);
    console.log("Disease Info", disease_info);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error in predictionController");
  }
};