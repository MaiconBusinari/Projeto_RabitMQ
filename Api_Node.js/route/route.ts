import { Router } from "express";
import { FolhaController } from "../controller/controller";

const router: Router = Router();

router.post("/folha/cadastrar", new FolhaController().cadastrar);

export { router };
