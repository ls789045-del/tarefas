// Execução local: npm start ou npm run dev
if (require.main === module) {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log("--------------------------------");
        console.log("API DE LISTA DE TAREFAS");
        console.log("--------------------------------");
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Endereço: http://localhost:${PORT}`);
        console.log("Supabase conectado!");
        console.log("--------------------------------");
    });
}

// Exportação para a Vercel
module.exports = app;
