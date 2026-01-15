import announcement from "../models/announcement.js";
import community from "../models/community.js";

const createAnnouncement = async(req, res) => {
    try {
        const currentUser = req.user._id
        const { title, content, communityId } = req.body
        
        if (!title || !title.trim()) {
            return res.status(400).json({ error: "Title is required" })
        }
        
        if (!content || !content.trim()) {
            return res.status(400).json({ error: "Content is required" })
        }
        
        if (!communityId) {
            return res.status(400).json({ error: "Community ID is required" })
        }
        
        // Check if community exists and user is creator or moderator
        const existingCommunity = await community.findById(communityId)
        if (!existingCommunity) {
            return res.status(404).json({ error: "Community not found" })
        }
        
        const isCreator = existingCommunity.creator.toString() === currentUser.toString()
        const isModerator = existingCommunity.moderators?.some(mod => mod.toString() === currentUser.toString())
        
        if (!isCreator && !isModerator) {
            return res.status(403).json({ error: "Only creator or moderators can create announcements" })
        }
        
        const data = await announcement.create({
            title: title.trim(),
            content: content.trim(),
            community: communityId,
            createdBy: currentUser
        })
        
        // Add announcement to community
        await community.findByIdAndUpdate(
            communityId,
            { $push: { announcements: data._id } },
            { new: true }
        ).exec()
        
        const populatedAnnouncement = await announcement.findById(data._id)
            .populate("createdBy", "name picture _id")
            .exec()
        
        res.status(201).json(populatedAnnouncement)
    } 
    catch(e){
        console.log(e)
        res.status(500).json({ error: "Failed to create announcement" })
    }     
}

const deleteAnnouncement = async(req, res) => {
    try {
        const announcementId = req.params.announcementId
        const currentUser = req.user._id
        
        // Find announcement
        const existingAnnouncement = await announcement.findById(announcementId)
        if (!existingAnnouncement) {
            return res.status(404).json({ error: "Announcement not found" })
        }
        
        // Find community
        const existingCommunity = await community.findById(existingAnnouncement.community)
        if (!existingCommunity) {
            return res.status(404).json({ error: "Community not found" })
        }
        
        // Check if user is creator or moderator
        const isCreator = existingCommunity.creator.toString() === currentUser.toString()
        const isModerator = existingCommunity.moderators?.some(mod => mod.toString() === currentUser.toString())
        const isAnnouncementCreator = existingAnnouncement.createdBy.toString() === currentUser.toString()
        
        if (!isCreator && !isModerator && !isAnnouncementCreator) {
            return res.status(403).json({ error: "Only creator, moderators, or announcement creator can delete announcements" })
        }
        
        // Remove announcement from community
        await community.findByIdAndUpdate(
            existingAnnouncement.community,
            { $pull: { announcements: announcementId } },
            { new: true }
        ).exec()
        
        // Delete announcement
        await announcement.findByIdAndDelete(announcementId).exec()
        
        res.json({ message: "Announcement deleted successfully" })
    } 
    catch(e){
        console.log(e)
        res.status(500).json({ error: "Failed to delete announcement" })
    }   
}

export { createAnnouncement, deleteAnnouncement }












