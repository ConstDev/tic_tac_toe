/**
 * Selectors:
 */
 const amountCellsSelectEl = document.querySelector('[data-role="amount-cells-picker"]');
 const levelSelectEl = document.querySelector('[data-role="level-picker"]');
 const resetButtonEl = document.querySelector('[data-role="game-reset"]');
 const restartButtonEl = document.querySelector('[data-role="game-restart"]');
 const playFieldEl = document.querySelector('[data-role="game-table"]');
 const amountPickerSectionEl = document.querySelector('[data-role="amount-picker-section"]');
 const gameResultEl = document.querySelector('[data-role="result-message"]');
 const firstOptionEl = document.querySelector('[data-role="default-select-option"]');
 const popupWindowEl = document.querySelector('[data-role="popup-window"]');
 const finalTitleEl = document.querySelector('[data-role="final-title"]');


 /** 
  * The following game rules:
  * 
 */
 const game = (() => {
   const data = {
     amount: 0,
     allValues: [],
     centerOfMatrix: 0,
     firstPlayerWinCombinations: [],
     secondPlayerWinCombinatons: [],
   };
 
   data.getIndexForPicking = function() {
     const actions = [
       { 
         isPresent: () => this.secondPlayerWinCombinatons.some(arr => arr.length === 1),
         getResult: () => [...this.secondPlayerWinCombinatons.find(arr => arr.length === 1)].pop()
       },
       { 
         isPresent: () => this.firstPlayerWinCombinations.some(arr => arr.length === 1),
         getResult: () => [...this.firstPlayerWinCombinations.find(arr => arr.length === 1)].pop()
       },
       { 
        isPresent: () => !this.secondPlayerWinCombinatons.length,
        getResult: () => {
          const foundArr = this.firstPlayerWinCombinations.find(arr => arr.length < this.amount);
          return foundArr[Math.floor(Math.random() * foundArr.length)];
        }
       },
       { 
         isPresent: () => this.secondPlayerWinCombinatons.some(arr => arr.length < this.amount),
         getResult: () => { 
           const foundArr = this.secondPlayerWinCombinatons.find(arr => arr.length < this.amount);
           return foundArr[Math.floor(Math.random() * foundArr.length)];
         }
       },
       { 
         isPresent: () => this.allValues.includes(this.centerOfMatrix),
         getResult: () => this.centerOfMatrix
       },
       { 
         isPresent: () => !!this.allValues.length,
         getResult: () => this.allValues[Math.floor(Math.random() * this.allValues.length)]
       }
     ];
     return actions.find(func => func.isPresent()).getResult();
   };
 
   data.isGameOver = function() {
    const options = [
        {
          isOver: () => !this.firstPlayerWinCombinations.length && !this.secondPlayerWinCombinatons.length,
          getData: () => ( { end: true, text: 'Draw' } ) 
        },
        {
          isOver: () => this.firstPlayerWinCombinations.some(arr => !arr.length),
          getData: () => ( { end: true, text: 'First player wins' } )
        },
        {
          isOver: () => this.secondPlayerWinCombinatons.some(arr => !arr.length),
          getData: () => ( { end: true, text: 'Second player wins' } )
        },
        {
          isOver: () => true,
          getData: () => ( { end: false, text: '' } )
        }
      ];
    return options.find(obj => obj.isOver()).getData();
    }
   return data;
 })();
 
 function getAllValues(amount) {
   return Array(amount * amount).fill()
       .map((_, index) => index)
 }
 
 function getCellMatrix(amount, allValues) {
     return Array(amount).fill().map(() => allValues.splice(0, amount));
 }
 
 function getCenterOfMatrix(amount) {
   return (amount*amount-1) / 2;
 }
 
 function pickedCell(index, isCross) {
  const cell =  document.querySelectorAll('[data-role="cell-button"]')[index];
  cell.disabled = true;
  const addData = isCross ? { sign: 'X' , cssClass: 'game__cell-cross'} : { sign: '0' , cssClass: 'game__cell-zero' };
  cell.textContent = addData.sign;
  cell.classList.add(addData.cssClass);
 }
 
/**
  *
  *  Pick up for
*/
 function getWinCombinations(matrix) {
  const winCombinations = [];
  matrix.forEach((row, indexRow) => {
      winCombinations.push(row);
      winCombinations.push(row.map((_, indexColumn) => matrix[indexColumn][indexRow]));
  });
  winCombinations.push(matrix.map((_, index) => matrix[index][index]));
  winCombinations.push(matrix.reverse().map((_, index) => matrix[index][index]));
  return winCombinations;
 }
 
 function removeUselessCombinations(combinations, index) {
  return JSON.parse(JSON.stringify(combinations.filter(arr => !arr.includes(index))));
 }
 
 function removePickedItems(combinations, index) {
  return JSON.parse(JSON.stringify(combinations.map(arr => arr.includes(index) ? arr.filter(el => el !== index) : arr)));
 } 
 
 
/*
** Functions for checking and displaying result
*/
function deactivateRestCells() {
      const cells = document.querySelectorAll('[data-role="cell-button"]');
      game.allValues.forEach(val => {
          const cell = cells[val];
          cell.disabled = true;
          cell.style.backgroundColor = 'red';
      });
}

function showFinalResult(text) {
  popupWindowEl.classList.remove('hide');
  finalTitleEl.textContent = text;
}

function finishGame(isOver, finalText) {
  if (isOver) {
    deactivateRestCells();
    showFinalResult(finalText);
  }
  return;
}
 
 /**
  *  HTML functions
  */
 
 function drawPlayTable(amount, cellsMatrix) {
     playFieldEl.innerHTML = Array(amount).fill().map((_, indexRow) =>
       `<div class="game__row">
        ${Array(amount).fill()
           .map((_, indexColumn) =>
             `<button
               class="game__cell cell__size--${amount}"
               value="${cellsMatrix[indexRow][indexColumn]}"
               data-role="cell-button">
               <button>`
           ).join('')}
       </div>`
     ).join('');

     document.querySelectorAll('[data-role="cell-button"]').forEach((button) => {
       button.addEventListener('click', (event) => {
          let index = +event.target.value;
          if (game.allValues.includes(index)) {
               game.allValues = game.allValues.filter(el => el !== index);
               pickedCell(index, true);
               game.firstPlayerWinCombinations = removePickedItems(game.firstPlayerWinCombinations, index);
               game.secondPlayerWinCombinatons = removeUselessCombinations(game.secondPlayerWinCombinatons, index);
               let result = game.isGameOver();
               console.log(result);
               finishGame(result.end, result.text);
               if (!result.end) {
                 index = game.getIndexForPicking();
                 game.allValues = game.allValues.filter(el => el !== index);
                 pickedCell(index, false);
                 game.secondPlayerWinCombinatons = removePickedItems(game.secondPlayerWinCombinatons, index);
                 game.firstPlayerWinCombinations = removeUselessCombinations(game.firstPlayerWinCombinations, index);
                 result = game.isGameOver();
                 console.log(result);
                 finishGame(result.end, result.text);
                }
          }
       });
     });
 }
 
 function showHideElements(showElement, hideElement) {
   showElement.classList.remove('hide');
   hideElement.classList.add('hide');
 }

 function restartGame() {
  showHideElements(amountPickerSectionEl, resetButtonEl);
  firstOptionEl.selected = true;
  playFieldEl.innerHTML = '';
  gameResultEl.innerHTML = '';
 }
 
 /**
  * Listeners: 
  * */ 
 amountCellsSelectEl.addEventListener('change', (event) => {
   const choice = +event.target.value;
   if (!!choice) {
     const allValues = getAllValues(choice);
     game.amount = choice;
     game.allValues = [...allValues];
     console.log(allValues);
     const matrix = getCellMatrix(choice, allValues);
     drawPlayTable(choice, matrix);
     game.centerOfMatrix = getCenterOfMatrix(choice);
     const winCombinations = getWinCombinations([...matrix]);
     console.log(winCombinations);
     game.firstPlayerWinCombinations = JSON.parse(JSON.stringify(winCombinations));
     game.secondPlayerWinCombinatons = JSON.parse(JSON.stringify(winCombinations));
     showHideElements(resetButtonEl, amountPickerSectionEl);
   }
 });
 /**
  * Comment the level of complexity functionality
  * 
  *    levelSelectEl.addEventListener('change', (event) => {
   const level = +event.target.value;
   console.log(level);
    });
  * 
  * 
  */

 resetButtonEl.addEventListener('click', _ => restartGame());

 restartButtonEl.addEventListener('click', () => {
  popupWindowEl.classList.add('hide');
  restartGame();
 });
