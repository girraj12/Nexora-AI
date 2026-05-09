import {
  getUserMemories,
  createMemory,
  deleteMemory,
} from './memory.service.js';

export const getMemories = async (req, res) => {
  try {
    const memories = await getUserMemories(req.user.id);

    return res.json(memories);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const addMemory = async (req, res) => {
  try {
    const { content, category } = req.body;

    const memory = await createMemory({
      userId: req.user.id,
      content,
      category,
    });

    return res.json({
      success: true,
      memory,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const removeMemory = async (req, res) => {
  try {
    await deleteMemory({
      userId: req.user.id,
      memoryId: req.params.id,
    });

    return res.json({
      success: true,
      message: 'Memory deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};