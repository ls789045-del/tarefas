
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// ==========================================
// CONFIGURAÇÕES DO SERVIDOR
// ==========================================

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ==========================================
// CONEXÃO COM SUPABASE
// ==========================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
        "Configure SUPABASE_URL e SUPABASE_KEY nas variáveis de ambiente."
    );
}

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        }
    }
);

// ==========================================
// ROTA INICIAL
// ==========================================

app.get("/", (req, res) => {
    res.status(200).json({
        mensagem: "API de Lista de Tarefas funcionando!",
        status: "Online",
        banco: "Supabase"
    });
});

// ==========================================
// GET - LISTAR TODAS AS TAREFAS
// ==========================================

app.get("/tarefas", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("tarefas")
            .select("*")
            .order("id", { ascending: false });

        if (error) throw error;

        res.status(200).json(data);

    } catch (error) {
        console.error("Erro ao listar tarefas:", error.message);

        res.status(500).json({
            mensagem: "Erro ao buscar tarefas",
            erro: error.message
        });
    }
});

// ==========================================
// GET - BUSCAR TAREFA POR ID
// ==========================================

app.get("/tarefas/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido"
            });
        }

        const { data, error } = await supabase
            .from("tarefas")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                mensagem: "Tarefa não encontrada"
            });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error("Erro ao buscar tarefa:", error.message);

        res.status(500).json({
            mensagem: "Erro ao buscar tarefa",
            erro: error.message
        });
    }
});

// ==========================================
// POST - CADASTRAR NOVA TAREFA
// ==========================================

app.post("/tarefas", async (req, res) => {
    try {
        const { titulo, descricao } = req.body;

        if (typeof titulo !== "string" || !titulo.trim()) {
            return res.status(400).json({
                mensagem: "O título da tarefa é obrigatório"
            });
        }

        if (
            descricao !== undefined &&
            typeof descricao !== "string"
        ) {
            return res.status(400).json({
                mensagem: "A descrição deve ser um texto"
            });
        }

        const { data, error } = await supabase
            .from("tarefas")
            .insert({
                titulo: titulo.trim(),
                descricao: descricao || "",
                concluida: false
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            mensagem: "Tarefa cadastrada com sucesso!",
            tarefa: data
        });

    } catch (error) {
        console.error("Erro ao cadastrar tarefa:", error.message);

        res.status(500).json({
            mensagem: "Erro ao cadastrar tarefa",
            erro: error.message
        });
    }
});

// ==========================================
// PUT - ATUALIZAR TAREFA
// ==========================================

app.put("/tarefas/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido"
            });
        }

        const { titulo, descricao, concluida } = req.body;

        const atualizacao = {};

        if (titulo !== undefined) {
            if (
                typeof titulo !== "string" ||
                !titulo.trim()
            ) {
                return res.status(400).json({
                    mensagem: "O título não pode ficar vazio"
                });
            }

            atualizacao.titulo = titulo.trim();
        }

        if (descricao !== undefined) {
            if (typeof descricao !== "string") {
                return res.status(400).json({
                    mensagem: "A descrição deve ser um texto"
                });
            }

            atualizacao.descricao = descricao;
        }

        if (concluida !== undefined) {
            if (typeof concluida !== "boolean") {
                return res.status(400).json({
                    mensagem: "O campo concluida deve ser verdadeiro ou falso"
                });
            }

            atualizacao.concluida = concluida;
        }

        if (Object.keys(atualizacao).length === 0) {
            return res.status(400).json({
                mensagem: "Informe pelo menos um campo para atualizar"
            });
        }

        const { data, error } = await supabase
            .from("tarefas")
            .update(atualizacao)
            .eq("id", id)
            .select()
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                mensagem: "Tarefa não encontrada"
            });
        }

        res.status(200).json({
            mensagem: "Tarefa atualizada com sucesso!",
            tarefa: data
        });

    } catch (error) {
        console.error("Erro ao atualizar tarefa:", error.message);

        res.status(500).json({
            mensagem: "Erro ao atualizar tarefa",
            erro: error.message
        });
    }
});

// ==========================================
// DELETE - EXCLUIR TAREFA
// ==========================================

app.delete("/tarefas/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido"
            });
        }

        const { data, error } = await supabase
            .from("tarefas")
            .delete()
            .eq("id", id)
            .select()
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                mensagem: "Tarefa não encontrada"
            });
        }

        res.status(200).json({
            mensagem: "Tarefa excluída com sucesso!"
        });

    } catch (error) {
        console.error("Erro ao excluir tarefa:", error.message);

        res.status(500).json({
            mensagem: "Erro ao excluir tarefa",
            erro: error.message
        });
    }
});

// ==========================================
// ROTA NÃO ENCONTRADA
// ==========================================

app.use((req, res) => {
    res.status(404).json({
        mensagem: "Rota não encontrada"
    });
});

// ==========================================
// TRATAMENTO DE ERROS
// ==========================================

app.use((err, req, res, next) => {
    console.error("Erro interno:", err);

    res.status(500).json({
        mensagem: "Erro interno no servidor"
    });
});

// ==========================================
// AJUSTE FINAL: EXECUÇÃO LOCAL E VERCEL
// ==========================================

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
