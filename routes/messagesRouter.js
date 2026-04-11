const { Router } = require("express");
const messagesController = require("../controllers/messagesController.js");

const messagesRouter = Router();

messagesRouter.get('/', messagesController.getIndex);

messagesRouter.get('/messages/new', messagesController.getNewMessage);
messagesRouter.post('/messages/new', messagesController.postNewMessage);

messagesRouter.post(
  '/messages/:id/delete',
  messagesController.postDeleteMessage,
);

module.exports = messagesRouter;