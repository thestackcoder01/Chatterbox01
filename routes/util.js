var names =  ['Tony Stark','labby','hacker','Alien','codiee','Selmon','labra007'];

function luckyname(){
   return names[Math.floor(Math.random()* 7)];
}

module.exports = luckyname;

