const router = require("express").Router();
const CallController = require("../controllers/callController");

router.post("/start", CallController.startCall);
router.post("/update-status", CallController.updateCallStatus);
router.get("/incoming/:astroId", CallController.getIncomingCalls);
router.get("/history/:userId", CallController.getCallHistory);
router.get("/earnings/:astroId", CallController.getEarnings);
router.get("/wallet/:astroId",CallController.getWallet);
router.get("/dashboard/:astroId",CallController.getAstroDashboard);


module.exports = router;
