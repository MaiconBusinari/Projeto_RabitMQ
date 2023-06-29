import express from "express";
import { router } from "../route/route";

const app = express();
const porta = 3000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);


app.listen(porta, () => {
    console.clear();
    console.log(`Aplicação de node rodando na porta ${porta}`);
});