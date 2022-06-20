import userRepository from "../repositories/userRepository.js"

export async function getUserPost(req,res){
    const {id} = req.params    

    try{
        const user = await userRepository.getUser(id)
        
        if(user.rows[0] === undefined){
            res.status(400).send("User not found")
        }

        res.status(200).send(user.rows)
        
    } catch(error){
        console.log(error)
        res.status(500).send(error.detail)
    }
}