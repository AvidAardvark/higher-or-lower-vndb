
let allVNs = []; //all vns used in the game (around 500; array allows for easy simulated randomness)
let imageUrlArray = []; //all image urls for the visual novels in allVNs array
let ratingArray = []; //all ratings for the visual novels in allVNs array
let leftStatus = 0; //checks if left image needs to be replaced (0 = empty, 1 = full)
let rightStatus = 0; //checks if right image needs to be replaced (0 = empty, 1 = full)
let leftVN; //current left visual novel title
let rightVN; //current right visual novel title
let leftRating = 0; //keeps track of current rating for left visual novel
let rightRating = 0; //same as above but for right visual novel
let leftScreenTime = 0; //used to determine which image will be replaced after the guess is made 
let rightScreenTime = 0; 
let score = 0; //num of current correct guesses made in a game (updates per guess)
document.getElementById("score").innerHTML = score; //the score is set to 0 at the beginning of the game
let highScore = localStorage.getItem("highScore") || 0; //highest score (initally set to 0 on the very first iteration of the code)
document.getElementById("highScore").innerHTML = highScore; //the current high score is displayed at the beginning of the game
let increment = 0;
let ratingElement;
let flag = 0;
let imagePlaceholder = new Image();
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
leftButton.disabled = true;
rightButton.disabled = true;
const happyEndScreenReactions = ["brofist", "celebrate", "cheers", "clap", "cool", "evillaugh", "happy", "headbang", "smile", "yay"]; //OtakuGIFs API (generate a random happy anime GIF when score >= 10 )
const sadEndScreenReactions = ["angrystare", "bite", "bleh", "confused", "cry", "drool", "facepalm", "huh", "sad", "nervous"]; //generate a random sad anime GIF when score <= 2
const averageEndScreenReactions = ["slowclap", "laugh", "run", "thumbsup", "peek", "nom", "roll", "surprised", "sip", "smug"]; //generate an image when 2 < score < 10
let reaction;
let max;

if (sessionStorage.getItem("runOnce") !== "true") { //code inside if statement will only be run once per session (refreshing will not restart session; tab or browser must be reopened)
    sessionStorage.setItem("runOnce", "true");
    const vnQueryArray = [ //queries (JSON objects to be used for POST requests) cover pages 1 through 12 of visual novels by highest votecount (most popular)
        {"page": 1, "sort": "votecount", "reverse": true, "fields": "title, image{sexual, violence, url}, rating", "results": 50}, 
        {"page": 2, "sort": "votecount", "reverse": true, "fields": "title, image{sexual, violence, url}, rating", "results": 50},
        {"page": 3, "sort": "votecount", "reverse": true, "fields": "title, image{sexual, violence, url}, rating", "results": 50},
        {"page": 4, "sort": "votecount", "reverse": true, "fields": "title, image{sexual, violence, url}, rating", "results": 50},
        {"page": 5, "sort": "votecount", "reverse": true, "fields": "title, image{sexual, violence, url}, rating", "results": 50},
        {"page": 6, "sort": "votecount", "reverse": true, "fields": "title, image{sexual, violence, url}, rating", "results": 50},
        {"page": 7, "sort": "votecount", "reverse": true, "fields": "title, image{sexual, violence, url}, rating", "results": 50},
        {"page": 8, "sort": "votecount", "reverse": true, "fields": "title, image{sexual, violence, url}, rating", "results": 50},
        {"page": 9, "sort": "votecount", "reverse": true, "fields": "title, image{sexual, violence, url}, rating", "results": 50},
        {"page": 10, "sort": "votecount", "reverse": true, "fields": "title, image{sexual, violence, url}, rating", "results": 50},
        {"page": 11, "sort": "votecount", "reverse": true, "fields": "title, image{sexual, violence, url}, rating", "results": 50},
        {"page": 12, "sort": "votecount", "reverse": true, "fields": "title, image{sexual, violence, url}, rating", "results": 50}
    ];

    const promises = vnQueryArray.map(vnQuery => //using the map function, each element is used in a fetch method that returns a promise (12 promises total in the promises array)
        fetch("https://api.vndb.org/kana/vn", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vnQuery)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Query could not fetch with POST")
                }
                return response.json();
            })
            .then(data => {
                for (let j=0; j<50; j++) {
                    if (data.results[j].image.sexual <= 0.4 && data.results[j].image.violence < 1) {
                        allVNs.push(data.results[j].title);
                        imageUrlArray.push(data.results[j].image.url);
                        ratingElement = data.results[j].rating;
                        ratingArray.push(ratingElement.toFixed(1));
                    }
                }
            })
    );

    Promise.all(promises) //ensures that the array data obtained from fetch is only copied to session storage AFTER the fetch method has gone through all 12 queries
        .then(data => {
            sessionStorage.setItem("allVNs", JSON.stringify(allVNs));
            sessionStorage.setItem("imageUrlArray", JSON.stringify(imageUrlArray));
            sessionStorage.setItem("ratingArray", JSON.stringify(ratingArray));
            randomVN();
        })
        .catch(error => console.error(error));
}

else {
    randomVN(); //the function will be called once per refresh after the game has been opened to reset the game 
}

function randomVN() {
    let storedVNs = JSON.parse(sessionStorage.getItem("allVNs"));  
    let storedImageUrls = JSON.parse(sessionStorage.getItem("imageUrlArray"));  
    let storedRatings = JSON.parse(sessionStorage.getItem("ratingArray"));  
    let randomIndex = Math.floor(Math.random() * (storedVNs.length)); 
    const checkImage = document.getElementById("check");
    let imgPreloader = new Image(); // creates new image object whose src will store preloaded images
    imgPreloader.src = storedImageUrls[randomIndex];
    //console.log(storedVNs.length); 
    //console.log(storedRatings);
    
    if (leftStatus === 0 && rightStatus === 0) {
        document.getElementById("left").src = storedImageUrls[randomIndex];
        document.getElementById("leftTitle").innerHTML = storedVNs[randomIndex]; //add left visual novel title
        storedRatings[randomIndex] /= 10;
        document.getElementById("leftRating").innerHTML = (Math.round(storedRatings[randomIndex] * 100) / 100).toFixed(2); //add left visual novel rating
        leftStatus = 1;
        leftVN = storedVNs[randomIndex];
        leftRating = storedRatings[randomIndex];
        randomVN();
    }

    else if (leftStatus === 1 && rightStatus === 0) {
        if (leftVN !== storedVNs[randomIndex] && rightVN !== storedVNs[randomIndex]) { //checks that the potential new right vn is not the same as left or previous right vn
            if (leftScreenTime !== rightScreenTime) { //if at least one button has been pressed (made to distinguish from the first function call at the beginning of the session)
                if (document.getElementById("leftRating").innerHTML === "") {
                    ratingElement = document.getElementById("leftRating");
                    max = leftRating;
                }
                else if (document.getElementById("rightRating").innerHTML === "") {
                    ratingElement = document.getElementById("rightRating");
                    max = rightRating;
                }

                counter(ratingElement, max, () => {
                    setTimeout(() => {
                        document.getElementById("rightRating").innerHTML = "";
                        document.getElementById("right").src = imgPreloader.src;
                        document.getElementById("rightTitle").innerHTML = storedVNs[randomIndex];
                    }, 1000);

                    document.getElementById("vs").classList.add("invisible");
                    checkImage.classList.add("moveDown");
                    checkImage.addEventListener("animationend", () => {//resets the animation by moving the image to its default position and removing the animation class
                        checkImage.style.transform = "translateY(-100%)";
                        checkImage.classList.remove("moveDown");
                        document.getElementById("vs").classList.remove("invisible");

                        //score updates on screen (highScore as well if the score is a high score)
                        document.getElementById("score").innerHTML = score;
                        if (highScore < score) {
                            highScore = score;
                            document.getElementById("highScore").innerHTML = highScore;
                        }
                        leftButton.disabled = false;
                        rightButton.disabled = false;
                    })
                });
            }
            else { //this code will only run before the first button click
                document.getElementById("right").src = storedImageUrls[randomIndex];
                document.getElementById("rightTitle").innerHTML = storedVNs[randomIndex];
                leftButton.disabled = false;
                rightButton.disabled = false;
            }
            rightStatus = 1;
            rightVN = storedVNs[randomIndex];
            storedRatings[randomIndex] /= 10;
            rightRating = (Math.round(storedRatings[randomIndex] * 100) / 100).toFixed(2);
        }
        else {
            randomVN();
        }
    }
    else if (leftStatus === 0 && rightStatus === 1) {
        if (rightVN !== storedVNs[randomIndex] && leftVN !== storedVNs[randomIndex]) { //checks that the potential new left vn is not the same as right or previous left vn
            if (rightScreenTime !== leftScreenTime) { //if at least one button has been pressed (made to distinguish from the first function call at the beginning of the session)
                if (document.getElementById("leftRating").innerHTML === "") {
                    ratingElement = document.getElementById("leftRating");
                    max = leftRating;
                }
                else if (document.getElementById("rightRating").innerHTML === "") {
                    ratingElement = document.getElementById("rightRating");
                    max = rightRating;
                }
                counter(ratingElement, max, () => {  //run result animation to show the guess was right
                    setTimeout(() => {
                        document.getElementById("leftRating").innerHTML = "";
                        document.getElementById("left").src = imgPreloader.src;
                        document.getElementById("leftTitle").innerHTML = storedVNs[randomIndex];
                    }, 1000);

                    document.getElementById("vs").classList.add("invisible");
                    checkImage.classList.add("moveDown");
                    checkImage.addEventListener("animationend", () => {//resets the animation by moving the image to its default position and removing the animation class
                        checkImage.style.transform = "translateY(-100%)";
                        checkImage.classList.remove("moveDown");
                        document.getElementById("vs").classList.remove("invisible");

                        //score updates on screen (highScore as well if the score is a high score)
                        document.getElementById("score").innerHTML = score;
                        if (highScore < score) {
                            highScore = score;
                            document.getElementById("highScore").innerHTML = highScore;
                        }
                        leftButton.disabled = false;
                        rightButton.disabled = false;
                    })
                });
            }
            leftStatus = 1;
            leftVN = storedVNs[randomIndex];
            storedRatings[randomIndex] /= 10;
            leftRating = (Math.round(storedRatings[randomIndex] * 100) / 100).toFixed(2);
        }
        else {
            randomVN();
        }
    }
}

function compareRating(leftOrRight) {
    leftButton.disabled = true;
    rightButton.disabled = true;
    if ((leftOrRight === "left" && leftRating >= rightRating) || (leftOrRight === "right" && rightRating >= leftRating)) { //if the answer is correct
        score++; //score increments by one for each correct guess made
        if (score > highScore) {
            localStorage.setItem("highScore", score); //use localStorage to store the high score even after the browser is closed
            //document.getElementById("highScore").innerHTML += localStorage.getItem("highScore");
        }
        if (leftScreenTime > rightScreenTime) { //whatever image has been on screen longer will be replaced, so the left image will be replaced if it has been on screen longer
            leftStatus = 0;
            leftScreenTime = 0;
            rightScreenTime++;
        }
        else if (leftScreenTime < rightScreenTime) {//same concept, but the right image will replace the left one
            rightStatus = 0;
            rightScreenTime = 0;
            leftScreenTime++;
        }
        else { //if leftScreenTime and rightScreenTime are equal (only possibility if neither are greater than the other), the image not clicked/lower rating vn will be replaced 
            if (leftOrRight === "left") {
                rightStatus = 0;
                leftScreenTime++;
            }
            else { //if leftOrRight is not equal to "left," it has to be equal to "right"
                leftStatus = 0;
                rightScreenTime++;
            }
        }
        randomVN();
    }
    else {//game over
        const reactionIndex = Math.floor(Math.random() * 10); //random index used to get random reaction word
        const xImage = document.getElementById("x");
        if (document.getElementById("leftRating").innerHTML === "") {//even if the answer is wrong, the other rating will still be shown before ending the game
            ratingElement = document.getElementById("leftRating");
            max = leftRating;
        }
        else if (document.getElementById("rightRating").innerHTML === "") {
            ratingElement = document.getElementById("rightRating");
            max = rightRating;
        }
        counter(ratingElement, max, () => { //run result animation & wrong animation
            document.getElementById("vs").classList.add("invisible");
            xImage.classList.add("moveDown"); //starts the animation (red x image moves down into the middle circle where the 'vs' is)
            xImage.addEventListener("animationend", () => {//resets the animation by moving the image to its default position and removing the animation class
                xImage.style.transform = "translateY(-100%)";
                xImage.classList.remove("moveDown");
                document.getElementById("vs").classList.remove("invisible");
                endScreen(reactionIndex);
            })
        });
        // show the hidden rating (right or left) through counter animation and then run wrong animation 
        //leftButton.disabled = false;
        //rightButton.disabled = false;
        // end game (game over screen)
    }
}

function counter(bTag, max, callback) {
    const numOfUpdates = Math.ceil(1000 / (1000 / 60)); //total number of times the rating will update before it stops
    const increment = (max - 0) / numOfUpdates; //how much the rating will be incremented by each update
    let currentRating = 0; //the current rating that is stored
    let counter = 0; //the current number of updates
  
    function updateCounter() {
      if (counter < numOfUpdates) {
        currentRating += increment;
        bTag.innerHTML = currentRating.toFixed(2);
        counter++;
        requestAnimationFrame(updateCounter);
      } 
      else {
        bTag.textContent = max;
        if (callback) {
            callback(); //call the callback after the animation is finished
        }
      }
    };
  
    requestAnimationFrame(updateCounter);
}

function endScreen(reactionIndex) {
    let reactionWord;
    document.getElementById("css").href = "gameover.css"; //replace css sheet for game over screen
    document.body.innerHTML = `
        <h1>Your Score: </h1>
        <h2 id="scoreEnd"></h2>
        <h3 id="endText">Insert Text Here 2</h3>
        <button id="playAgain" onclick="location.reload()">Play Again</button>
    `;
    document.getElementById("scoreEnd").innerHTML = score; //shows the score the user reached 
    if (score >= 10) {
        document.getElementById("endText").innerHTML = "That's a pretty high score.";
        reactionWord = happyEndScreenReactions[reactionIndex];
    }
    else if (score > 2) {
        document.getElementById("endText").innerHTML = "Average.";
        reactionWord = averageEndScreenReactions[reactionIndex];
    }
    else {
        document.getElementById("endText").innerHTML = "One of the scores of all time."
        reactionWord = sadEndScreenReactions[reactionIndex];
    }
    fetch(`https://api.otakugifs.xyz/gif?reaction=${reactionWord}&format=gif`) //fetches a GIF to put on the end screen (like the text, the GIF is chosen based on the score)
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not fetch GIF")
            }
            return response.json();
        })
        .then(data => {
            const gifURL = data.url;
            const img = new Image();
            img.onload = () => {
                document.body.style.backgroundImage = `url('${gifURL}')`;
            };
            img.src = gifURL;
        })
}