import hashtagRepository from "../repositories/hashtagRepository.js";
import db from "../../config/db.js";
import getMetaData from "metadata-scraper";

export async function identifyHashtags(req, res, next) {
  res.locals.hashtags = [];

  let texto = req.body.text.split("\n");
  texto = texto.join("");
  texto = texto.split(" ");

  let hashtags = [];
    
  texto.map(t =>{
    if(t[0] === "#"){
      hashtags.push(t);
    }
  });

  hashtags.map((hashtag) => {
    let h = "";
    if (hashtag !== " " && hashtag !== "") {
      res.locals.hashtags.push(hashtag.replace("#", ""));
    }
  });

  next();
}

export async function verifyHashtags(req, res, next) {
  const hashtags = res.locals.hashtags;

  if (hashtags.length === 0 || hashtags === undefined) {
    next();
  } else {
    try {
      let verifiedHashtags = await hashtagRepository.getHashtags(hashtags);
      res.locals.hashtagsToCreate = verifiedHashtags.hashtagsToCreate;
      res.locals.hashtagIds = verifiedHashtags.hashtagIds;

      next();
    } catch (err) {
      console.log(err);
      res.statusSend(404);
    }
  }
}

export async function createHashtag(req, res, next){
  const {hashtags , hashtagsToCreate} = res.locals;

  if(hashtags.length === 0){
    next();
  }else{
    if(hashtagsToCreate.length !== 0 && hashtagsToCreate !== undefined && hashtagsToCreate !== []){

      let contador = 0;
      
      hashtagsToCreate.map(hashtag => {
        const newHashtag =  db.query(`
          INSERT INTO hashtags (name)
          VALUES ($1)` 
          , [hashtag]);
      
        
        newHashtag.then(() => {
        contador++;
        
          if(contador === hashtagsToCreate.length){
            const newHashtagsIds = hashtagRepository.getHashtags(hashtagsToCreate);
  
            newHashtagsIds.then(r =>{
              res.locals.hashtagIds = [...res.locals.hashtagIds, ...r.hashtagIds]
              next();
            });
            newHashtagsIds.catch(err => {
              console.log(err);
              res.statusSend(404)
            });
          }
            
        });
          newHashtag.catch(err => {
            console.log(err);
            res.statusSend(404);
          });
      }); 
    }else{
    next();
    }
  }    
}

export async function relRegisterPostHashtags(req, res) {
  const { hashtags, postId, hashtagIds } = res.locals;

  if (hashtags.length === 0) {
    res.status(201).send("Post publicado com sucesso.");
  } else {
    try {
      hashtagIds.map((hashtagId) => {
        const newRelPostHashtag = hashtagRepository.insertRelPostHashtags(postId, hashtagId);
      });

      res.status(201).send("Post publicado com sucesso.");
    } catch (err) {
      console.log(err);
      res.statusSend(404);
    }
  }
}

// export async function getPostsWithHashtag(req, res) {
//   const { hashtag } = req.params;
//   let { offset } = req.query;
//   if (!offset) {
//     offset = 0;
//   }

//   let newPosts = [];

//   try {
//     const posts = await hashtagRepository.getPostsWithHashtag(hashtag, offset);
//     const getPosts = posts.rows;

//     for (let post of getPosts) {
//       const data = await getMetaData(post.link);
//       newPosts.push({
//         ...post,
//         title: data.title,
//         description: data.description,
//         image: data.image,
//       });
//     }
//     res.send(newPosts);
//   } catch (err) {
//     console.log(err);
//     res.sendStatus(404);
//   }
// }

export async function getPostsWithHashtag(req, res){
  const {hashtag} = req.params;
  let { offset } = req.query;
  if (!offset) {
    offset = 0;
  }
  let newPosts = [];
 
  try{
    const posts = await hashtagRepository.getPostsWithHashtag(hashtag, offset)
    const getPosts = posts.rows

    for (let post of getPosts) {
      const data = await getMetaData(post.link);
      newPosts.push({
        ...post,
        title: data.title,
        description: data.description,
        image: data.image
      });
      console.log(newPosts)
    }
    res.send(newPosts);

}catch(err){
    console.log(err);
    res.sendStatus(404);
  }

}

export async function getHashtagTrending(req , res){
  try{
    const reqHashtagTrending = await hashtagRepository.getHashtagTrending();
    const hashtagTrending = reqHashtagTrending.rows;
    
    res.send(hashtagTrending);

  }catch(err){
    console.log(err)
    res.statusSend(404);
  }
}