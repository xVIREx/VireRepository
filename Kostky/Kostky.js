let countValues = [2.6339425, 2.4607015, 2.9546255, 3.9294165, 5.275825, 7.146476];
let border = 0.81;

let dicesText = document.getElementById("dicesTxt");
let betterDicesText = document.getElementById("betterDicesTxt");
let scoreText = document.getElementById("scoreTxt");
let resultText = document.getElementById("resultTxt");
let betterResultText = document.getElementById("betterResultTxt");
let betterScoreText = document.getElementById("betterScoreTxt");

let currentDices = [];
let currentScore = 0;
let addedScore = 0;

function clicked_dice_btn(dice) {
  currentDices.push(dice);
  dicesText.textContent = currentDices;
  currentScore = count_score(currentDices, 0) + addedScore;
  scoreText.textContent = currentScore*100;
  get_result();
}

function clicked_score_btn(score) {
  addedScore += score;
  currentScore += score;
  scoreText.textContent = currentScore*100;
  get_result();
}

function clicked_reset_btn() {
  currentScore = 0;
  addedScore = 0;
  scoreText.textContent = "0";

  currentDices = [];
  dicesText.textContent = "–";
  get_result();
}

function get_result() {
  if(currentDices.length==0) {
    resultText.textContent = "";
    betterDicesText.textContent = "";
    betterResultText.textContent = "";
    betterScoreText.textContent = "";
    return;
  }
  let dicesValue = count_score(currentDices, 0) + countValues[remove_dices(currentDices)-1];
  let record = [dicesValue, remove_dices2(currentDices, [0, 1, 2, 3, 4, 5])];
  let dicesToRemove = [0];
  let corDices = count_correct_dices(currentDices);    

  while (dicesToRemove.length != corDices && corDices != 0) {
    let _dices = remove_dices2(currentDices, dicesToRemove);
    dicesValue = count_score(subtract_arrays(currentDices, _dices), 0) + countValues[_dices.length-1];
    if(dicesValue>record[0]) {
      record[0] = dicesValue;
      record[1] = _dices;
    }

    for (let i = dicesToRemove.length-1; i > -1; i--) {        
      if (dicesToRemove[i] == corDices - (dicesToRemove.length-i)) {
        if(i==0) {
          dicesToRemove = new Array(dicesToRemove.length+1);
          for(let k = 0; k<dicesToRemove.length; k++) {
            dicesToRemove[k] = k;
          }
          break;
        }
        for(let j = i-1; j>-1; j--) {
          if(dicesToRemove[j] < corDices - (dicesToRemove.length-j)){
            dicesToRemove[i] = dicesToRemove[j] + (i-j) + 1;
            break;
          }            
        }
        continue;
      }
      else {     
        dicesToRemove[i]++;
        break;
      }
    } 
  }    

  let _betterScore = addedScore + (record[0] - countValues[record[1].length-1]);

  if(record[1].length != remove_dices(currentDices) && corDices != 0 && record[1].length != 0 && _betterScore / countValues[record[1].length-1] <= border) {
    betterDicesTxt.textContent = "–––> " + record[1];
    betterResultText.textContent = _betterScore / countValues[record[1].length-1] > border ? "NO" : "YES";
    betterScoreText.textContent = "–––> " + Math.round(_betterScore * 100);
  }else {
    betterDicesTxt.textContent = "";
    betterResultText.textContent = "";
    betterScoreText.textContent = "";
  }  
  resultText.textContent = (currentScore/countValues[remove_dices(currentDices)-1])>border ? "NO" : "YES"; 
  console.log(remove_dices(currentDices));
}

function count_correct_dices(dices) {  
  dices.sort(function(a, b){return a-b});
  if(array_equals(dices, [1, 2, 3, 4, 5, 6])) {
    return 0;
  };
  let _dices = dices.slice(0);  
  let count = 0;
  for (i = 1; i < 7; i++) {
    let _count = count_elements(dices, i);
    if (_count >= 3) {
      count++;
      for (j = _dices.length-1; j > -1; j--) {
        if(_dices[j] == i) {
          _dices.splice(j, 1);
        }
      }    

    }
  }
  for (i = _dices.length-1; i > -1; i--) {
    if(_dices[i] == 1 || _dices[i] == 5) {   
      count++;   
      _dices.splice(i, 1);
    }
  }  
  return count;
}

function remove_dices(dices) {
  dices.sort(function(a, b){return a-b});
  if(array_equals(dices, [1, 2, 3, 4, 5, 6])) {
    return 6;
  };
  let _dices = dices.slice(0);  
  let score = 0;
  for (i = 1; i < 7; i++) {
    let _count = count_elements(dices, i);
    if (_count >= 3) {
      for (j = _dices.length-1; j > -1; j--) {
        if(_dices[j] == i) {
          _dices.splice(j, 1);
        }
      }    

    }
  }
  for (i = _dices.length-1; i > -1; i--) {
    if(_dices[i] == 1 || _dices[i] == 5) {      
      _dices.splice(i, 1);
    }
  }
  if(_dices.length == 0) return 6;
  return _dices.length;
}

function remove_dices2(dices, indexes) {
  let _dices = dices.slice(0);  
  _dices.sort(function(a, b){return a-b});
  if(array_equals(_dices, [1, 2, 3, 4, 5, 6])) {
    return _dices;
  };
  let val = 0;    
  let score = 0;
  for (i = 1; i < 7; i++) {
    let _count = count_elements(dices, i);
    if (_count >= 3) {
      if(indexes.includes(val)) {
        for (j = _dices.length-1; j > -1; j--) {            
          if(_dices[j] == i) {
            _dices.splice(j, 1);
          }                 
        }  
      }
      val++;  
    }
  }
  for (i = _dices.length-1; i > -1; i--) {    
    if(_dices[i] == 1 || _dices[i] == 5) {      
      if(indexes.includes(val)) {
        _dices.splice(i, 1);
      }
      val++;
    } 
  }    
  return _dices;
}

function count_score(dices, previousThrow) {
  dices.sort(function(a, b){return a-b});
  if (array_equals(dices, [1, 2, 3, 4, 5, 6])) return 15;
  let score = 0.0;
  for (i = 1; i < 7; i++) {
    if (count_elements(dices, i) >= 3) {
      if (i == 1) {
        score += 10 * (count_elements(dices, i) - 2)
      } else {
        score += i * 1 * (count_elements(dices, i) - 2)
      }
    }
  }

  if (count_elements(dices, 1) < 3) score += 1 * count_elements(dices, 1);
  if (count_elements(dices, 1) < 3) score += 0.5 * count_elements(dices, 5);

  if(score==0) {return 0;}
  return score + previousThrow;
}

function new_dices(count) {
  return Array.from({length: count}, () => (Math.floor(Math.random() * 6)) + 1);
}

function count_elements(array, element) {
  let count = 0;
  for (var i = 0; i < array.length; i++) {
    if (array[i] == element)
      count++;
  }
  return count;
}

function get_count_values() {
  let precise = 1000000;
  for(let i = 0; i<6; i++) {
    countValues.push(0);
    let score = 0;
    let average = 0;
    for(let j = 0; j<precise; j++) {
      dices = new_dices(i+1);
      let _score = count_score(dices, 0);
      while (_score!=0) {
        score += _score;
        dices = new_dices(remove_dices(dices));
        _score = count_score(dices, 0);
      }
    }
    average = score/precise;
    countValues[i] = average;
  }
  console.log(countValues)
}

function get_border() {
  let highest = [0, 0]
  let value = 10000000;
  for(let border = 0.85; border>0.75; border-=0.02){
    let average = 0;
    for(let i = 0; i<value; i++){
      let dices = new_dices(6);
      let score = count_score(dices, 0);
      while (score!=0) {
        if(score/countValues[remove_dices(dices, 0)]>border){
          break;
        }
        dices = new_dices(remove_dices(dices, 0));
        score = count_score(dices, score);
      }
      average += score;
    }
    average /= value; 
    if(average>highest[0]) {
      highest = [average, border]
    }
    console.log(average + " " + Math.round(border*100)/100);

  }
  console.log(highest[1]);
}

function array_equals(a, b) {
  return Array.isArray(a) &&
  Array.isArray(b) &&
  a.length === b.length &&
  a.every((val, index) => val === b[index]);
}

function subtract_arrays(arr1, arr2) {
  arr1 = arr1.slice(0).sort(function(a, b){return a-b});
  arr2 = arr2.slice(0).sort(function(a, b){return a-b});

  for(let i = 0; i<arr2.length; i++) {
    if(arr1.includes(arr2[i])) {
      arr1.splice(arr1.indexOf(arr2[i]), 1);
    }
  }

  return arr1;
}
