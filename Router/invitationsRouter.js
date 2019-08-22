const express = require('express');
const router = express.Router();
const {Invitations, Users} = require('../Database');

router.get('/',async (req,res) => {     //get all invitations
    let response = await Invitations.findAll();
    res.status(200).send(response);
})
router.post('/', async (req,res) => {   //create new invitations to the group for every member in users array
    let {users,name,groupId,groupName} = req.body.newGroup;
    for(let i = 0; i< users.length; i++)
    {
        let builtInvitation = await Invitations.create({
            sender: name,
            groupName: groupName,
            groupId: groupId
        });
        let current = await Users.findByPk(users[i].id);
        await current.addInvitation(builtInvitation);
    }
    res.status(200).send();
})

router.put('/', async (req,res) =>{     //returns all invitations associated with a user
    let response = await Invitations.findAll({
        where: {UserId : req.body.id}
    })

    res.status(200).send(response);
})

module.exports = router;