const {DocPatConversation,DocNurConversation} = require("../models/conversations-model");

const getDocConversationsWithPat= async (req, res) => {
    const doc_id = req.params.doc_id

    try{
       const docConversations = await DocPatConversation.find({ "doctor_id": doc_id });

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

/////////////////////////////////////////////////////////////

const getDocConversationsWithNur= async (req, res) => {
    const doc_id = req.params.doc_id

    try{
       const docConversations = await DocNurConversation.find({ "doctor_id": doc_id });

       if(!docConversations){
         return res.status(404).json({status: "fail",data: null})
       }


       res.json({status: "success",data: {docConversations: docConversations}})
    }catch(err){
       res.status(400).json({
	@@ -17,5 +41,27 @@ const getDocConversations= async (req, res) => {
       })
    }
};
//////////////////////////////////////////
const getNurConversationsWithDoc= async (req, res) => {
    const nur_id = req.params.nur_id

    try{
       const nurConversations = await DocNurConversation.find({ "nurse_id": nur_id });

       if(!nurConversations){
         return res.status(404).json({status: "fail",data: null})
       }


       res.json({status: "success",data: {nurConversations: nurConversations}})
    }catch(err){
       res.status(400).json({
          status: "error",
          message: err.message
       })
    }
};



module.exports = {  getDocConversationsWithPat,getDocConversationsWithNur ,getNurConversationsWithDoc };   
