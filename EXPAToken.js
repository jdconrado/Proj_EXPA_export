// This class is not ready for usage

const requests = require('request');
const EXPAToken = class {

    constructor(mail, password){
        this.mail = mail;
        this.password = password;
        this.jar = requests.jar();
    }

    getToken(){
        let PARAMS = {
            'user[email]': this.mail,
            'user[password]': this.password,
            'jar': this.jar
        }
        return requests.post("https://auth.aiesec.org/users/sign_in",PARAMS, (error, res, body) =>{
            //console.log( {'error': error, 'res': res, 'jar': this.jar});
        });

    }
}

module.exports = EXPAToken;