const bcrypt = require("bcrypt");

const users = [
{ name: "User1", password: "password123" },
{ name: "User2", password: "password456" },
{ name: "User3", password: "password789" }
];

users.forEach(user => {
bcrypt.hash(user.password, 10, (err, hash) => {
if (err) {
console.error(err);
} else {
console.log(`${user.name}: ${hash}`);
}
});
});
