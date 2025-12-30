import Group from "../models/Group.js";

export const createGroup = async (req, res) => {
  try {
    const { name, memberIds } = req.body;

    if (!name || !memberIds || !memberIds.length) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const group = await Group.create({
      name,
      admin: req.userId,
      members: [req.userId, ...memberIds],
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const addMemberToGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only admin can add
    if (group.admin.toString() !== req.userId) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
