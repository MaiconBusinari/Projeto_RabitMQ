using System.Text;
using System.Text.Json;
using Newtonsoft.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
var folhas = new List<Folha>();

app.MapGet("/", () => "Hello World!");

//Definindo rotas
app.MapGet("/folha/listar", () =>
{
    return JsonConvert.SerializeObject(folhas);
});

app.MapGet("/folha/total", () =>
{
    var liquidoTotal = 0;
    foreach (var folha in folhas)
    {
        liquidoTotal = Convert.ToInt32(folha.Liquido) + liquidoTotal;
    }
    return $"O total de salarios liquidos pago foi de: {liquidoTotal:C2} reais";
});

app.MapGet("/folha/media", () =>
{
    var liquidoTotal = 0;
    foreach (var folha in folhas)
    {
        liquidoTotal = Convert.ToInt32(folha.Liquido) + liquidoTotal;
    }
    var media = liquidoTotal / folhas.Count;
   
   return $"Foram recebedidas um total de {folhas.Count}, a soma total liquida é de {liquidoTotal:C2}, sendo assim a media é de {media:C2}";
});

//RabbitMQ

//Configurado localhost
var factory = new ConnectionFactory { HostName = "localhost" };
//Conectando com RabbitMQ
using var connection = factory.CreateConnection();
//Criado canal dentro da concção criada anteiormente
using var channel = connection.CreateModel();


//Configurando a fila
channel.QueueDeclare(
    queue: "folha_queue",
    durable: false,
    exclusive: false,
    autoDelete: false,
    arguments: null
);

Console.WriteLine("Aplicação de node rodando na porta 5173");

//Configurar o consumidor
var consumidor = new EventingBasicConsumer(channel);

//Mensagem recebida e exibida
consumidor.Received += (model, ea) =>
{
    var body = ea.Body.ToArray();
    var mensagem = Encoding.UTF8.GetString(body);

    var folha = JsonConvert.DeserializeObject<Folha>(mensagem);
    if (folha != null)
    {
        folhas.Add(folha);
    };
};

//Consumir mensagem
channel.BasicConsume(
    queue: "folha_queue",
    autoAck: true,
    consumer: consumidor
);

app.Run();
