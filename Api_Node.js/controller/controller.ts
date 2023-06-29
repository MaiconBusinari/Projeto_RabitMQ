
import { Folha } from "../src/model/folha_model";
import { Calcular } from "../src/services/calcular";
import amqp from "amqplib";

export class FolhaController{

   async cadastrar(req, res){
        

    //Recebimento de dados
    const requisição = req.body;

    const folha: Folha = {
        mes: requisição.mes,
        ano: requisição.ano,
        horas: requisição.horas,
        valor: requisição.valor,
        nome: requisição.funcionario.nome,
        cpf: requisição.funcionario.cpf,
        bruto: 0,
        irrf: 0,
        inss: 0,
        fgts: 0,
        liquido: 0
    }

    //Processamento de dados
    const calcular = new Calcular();

    folha.bruto = calcular.calcularBruto(folha.horas, folha.valor);
    folha.irrf = calcular.calcularIRRF(folha.bruto);
    folha.inss = calcular.calcularINSS(folha.bruto);
    folha.fgts = calcular.calcularFGTS(folha.bruto);
    folha.liquido = calcular.calcularLiquido(folha.bruto, folha.inss, folha.irrf);

    folha.bruto =  parseFloat(folha.bruto.toFixed(2));
    folha.irrf =  parseFloat(folha.irrf.toFixed(2));
    folha.inss =  parseFloat(folha.inss.toFixed(2));
    folha.fgts =  parseFloat(folha.fgts.toFixed(2));
    folha.liquido =  parseFloat(folha.liquido.toFixed(2));


    //RabbitMQ

    //Nome da fila
    const fila = "folha_queue";
    //Url do RabbitMQ do Docker
    const rabbitMQ = "amqp://localhost";

    //Tratando possiveis erro
    try {
        //Conectando com RabbitMQ
        const coneccao = await amqp.connect(rabbitMQ);
        //Criado canal dentro da concção criada anteiormente
        const canal = await coneccao.createChannel();

        //Configurando a fila
        await canal.assertQueue(fila, {
            autoDelete: false,
            exclusive: false,
            durable: false,
            arguments: null,
        });

        //Enviando mensagem pela fila
        await canal.sendToQueue(fila, Buffer.from(JSON.stringify(folha)));

        //Fechando fila e conecção
        await canal.close();
        await coneccao.close();

    } catch (error) {
        console.log(error);
    }


    return res.status(200).json({
        data: folha
    });
    }
}