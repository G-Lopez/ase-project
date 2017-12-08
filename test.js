/*str = 'something'
str2 = 'pls'

firstExp = new RegExp('(?=.*\\b' + str + '\\b)' + '(?=.*\\b' + str2 + '\\b)')
secondExp = /(?=.*\bthere\b)(?=.*\bis\b)/

three = new RegExp(firstExp.source + secondExp.source)

console.log(firstExp);
console.log(three);

four = /(?=.*\bmeat\b)(?=.*\bpasta\b)(?=.*\bdinner\b).+/

console.log(three.test('is pls there that matches this however? else something '))

console.log(four.test('idk pls why this works but meat and pasta blahhh for dinner'));

console.log(firstExp);


console.log(firstExp.source);

word = 'J.K.'
temp = new RegExp('(?=.*\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b)')

console.log(temp);



str = 'j.k. rowling'

console.log(str.split(/[ ,.]+/));
*/

let obj = {}
obj['fields'] = {}
obj.fields['field'] = 2
console.log(obj);


fields ={books_added2: 1, books_requested: 0}

for (let field in fields) {
  //skip if object property
  if (!fields.hasOwnProperty(field)) continue;
  //validation
  console.log((field == 'books_added' || field == 'books_requested') && (fields[field] == 1 || fields[field] == -1))
}
