const symbols = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const inputBox = document.getElementById("inputBox");
const outputTable = document.getElementById("table");

// Loading the word list
let wordList;
let lang = "en";

// Format a word as a standard pattern
//  (substitute characters with those from the symbols string)
function patternify(word) {
  const patternMap = new Map();
  let symbolIndex = -1;
  let patternString = "";
  for(let i = 0; i < word.length; i++) {
    if(!patternMap.has(word[i])) {
      symbolIndex++;
      patternMap.set(word[i], symbols[symbolIndex]);
    }
    patternString += patternMap.get(word[i]);
  }
  return patternString;
}

// Turn a pattern into a searchable Regex expression
//  i'm so sorry
function regexify(pattern) {
  const patternMap = new Map();
  let symbolIndex = 1;
  let regexExp = '';
  for(let i = 0; i < pattern.length; i++) {
    if(!patternMap.has(pattern[i])) {
      // Create a new capture group for a new character
      regexExp += "(\\w)";
      // Add negative lookbehinds to ensure that
      //  the capture group doesn't capture existing characters
      patternMap.forEach((value) => {
        // i love regex
        regexExp += `(?<!\\${value})`;
      });
      // Record the new character's capture group number in patternMap
      patternMap.set(pattern[i], symbolIndex);
      symbolIndex++;
    } else {
      // Reference an existing capture group
      regexExp += `\\${patternMap.get(pattern[i])}`;
    }
  }
  return new RegExp(`(?<=")${regexExp}(?=")`, "g");
}

function submit() {
  const input = inputBox.innerText;
  console.log(input);
  const regexExp = regexify(input);
  console.log(regexExp);
  if(wordList) {
    const matchResult = JSON.stringify(wordList).match(regexExp);
    matchResult.sort((a, b) => wordList[b] - wordList[a]);
    document.getElementById("patternText").innerText = `pattern: ${patternify(input)}`;
    const tableBody = outputTable.getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";
    matchResult.forEach(match => {
      var newRow = tableBody.insertRow();
      var wordCell = newRow.insertCell();
      var freqCell = newRow.insertCell();
      wordCell.appendChild(document.createTextNode(match));
      freqCell.appendChild(document.createTextNode(wordList[match]));
      console.log(`${match}: ${wordList[match]}`);
    });
    outputTable.style.visibility = "visible";
  }
}

function languageChange(radio) {
  if(lang == radio.value)
    return;
  wordList = null;
  lang = radio.value;
  switch(radio.value) {
    case "en":
      fetch("english.json")
        .then(response => response.json())
        .then(json => (wordList = json));
      break;
    case "es":
      console.log("to spanish");
      fetch("spanish.json")
        .then(response => response.json())
        .then(json => (wordList = json));
      break;
  }
}

document.onkeydown = function(event) {
  if(event.key == "Enter") {
    event.preventDefault();
    if(inputBox.innerText)
      submit();
  }
}

fetch("english.json")
  .then(response => response.json())
  .then(json => (wordList = json));