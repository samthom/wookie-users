import http from 'k6/http';
import { Faker } from "k6/x/faker";
import { sleep } from "k6"

let f = new Faker(9863);

export const options = {
    vus: 5,
    duration: "30s",
};

const users = ["sam", "susmi", "catherine", "niran", "zane", "adlin"];

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

export default function() {
    const url = "http://localhost:8000/api/posts";
    const payload = JSON.stringify({
        title: f.loremIpsumSentence(5),
        content: f.loremIpsumParagraph(1, 5, 50, "."),
        user_email: `${users[getRandomInt(users.length)]}@wookie.com`
    });

    const params = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    http.post(url, payload, params);
    sleep(1);
}
