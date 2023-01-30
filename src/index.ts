import express, { Request, Response } from 'express'
import cors from 'cors'
import { accounts } from './database'
import { ACCOUNT_TYPE } from './types'

const app = express()

app.use(express.json())
app.use(cors())

app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003")
})

app.get("/ping", (req: Request, res: Response) => {
    res.send("Pong!")
})

app.get("/accounts", (req: Request, res: Response) => {
    res.send(accounts)
})

app.get("/accounts/:id", (req: Request, res: Response) => {
    try {

        const id = req.params.id

        const result = accounts.find((account) => account.id === id) 

        if(!result){
            res.status(404)
            throw new Error("Conta não encontrada. Verifique a 'id'.")
        }

        res.status(200).send(result)

    } catch (error) {
        console.log(error)
        
        if(res.statusCode === 200){

            res.send(500)
        }   
        
        res.send(error.message)

    }
    
   
})

app.delete("/accounts/:id", (req: Request, res: Response) => {
    
    try {

        const id = req.params.id

        if(id[0] !== "a"){
            res.status(400)
            throw new Error("'id' inválida. A 'id' deve iniciar com a letra 'a'.")
        }

        const accountIndex = accounts.findIndex((account) => account.id === id)

        if (accountIndex >= 0) {
            accounts.splice(accountIndex, 1)
        }

        
    } catch (error: any) {

        console.log(error)
        
        if (res.statusCode === 200) {
            res.status(500)
        }
        
        res.send(error.message)
    }

    res.status(200).send("Item deletado com sucesso")
})

app.put("/accounts/:id", (req: Request, res: Response) => {
    try {
        const id = req.params.id

        const newId = req.body.id 
        const newOwnerName = req.body.ownerName
        const newBalance = req.body.balance
        const newType = req.body.type

        // validação do newId
        // string que inicia com 'a'
        if (newId !== undefined){
            if(typeof newId !== "string"){
                res.status(400)
                throw new Error("'id' deve ser uma string.")
            }

            if(newId[0] !== "a"){
                res.status(400)
                throw new Error("'id' inválida. A 'id' deve iniciar com a letra 'a'.")
            }
        }
        // validação do newOwnerName
        // string que possui no mínimo
        // 2 caracteres

        if(newOwnerName.length < 2){
            res.status(400)
            throw new Error("A 'id' deve ter ao menos 2 caracteres.")
        }

        if (newBalance !== undefined) {
            if (typeof newBalance !== "number") {
                res.status(400)
                throw new Error("'balance' deve ser um number")
            }

            if (newBalance < 0) {
                res.status(400)
                throw new Error("'balance' não pode ser negativo")
            }
        }

        if (newType !== undefined) {
            if (
                newType !== "Ouro" &&
                newType !== "Platina" &&
                newType !== "Black"
            ) {
                res.status(400)
                throw new Error("'type' deve ser uma categoria válida")
            }
        }

        const account = accounts.find((account) => account.id === id)

        if (account) {
            account.id = newId || account.id
            account.ownerName = newOwnerName || account.ownerName
            account.type = newType || account.type

            account.balance = isNaN(newBalance) ? account.balance : newBalance
        }

        res.status(200).send("Atualização realizada com sucesso")

    } catch (error: any) {
        console.log(error)

        if (res.statusCode === 200) {
            res.status(500)
        }

        res.send(error.message)
    }
})

