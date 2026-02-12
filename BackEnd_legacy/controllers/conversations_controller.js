const Conversation = require("../models/conversations-model");

const getDocConversations= async (req, res) => {
    const doc_id = req.params.doc_id
    
    try{
       const docConversations = await Conversation.find({ "doctor_id": doc_id });
       
       if(!docConversations){
         return res.status(404).json({status: "fail",data: null})
       }
       res.json({status: "success",data: {docConversations: docConversations}})
    }catch(err){
       res.status(400).json({
          status: "error",
          message: err.message
       })
    }
};

module.exports = {  getDocConversations };   
