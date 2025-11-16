import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'API DraftMe está funcionando!' });
});

export default router;
