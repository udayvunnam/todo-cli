#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const program = new Command();
program.version('0.0.1');
const TODO_FILENAME = `${__dirname}/todo.txt`;
const DONE_FILENAME = `${__dirname}/done.txt`;

program.command('help').description('show usage').action(help);
program.command('add [description]').description('add a new todo').action(add);
program.command('ls').description('show remaining todos').action(list);
program.command('report').description('statistics').action(statistics);
program.command('del [number]').description('delete a todo').action(deleteTodo);
program.command('done [number]').description('complete a todo').action(doneTodo);

// print help if there is no sub-command
if (!process.argv.slice(2).length) {
  help();
  return;
}

program.parse(process.argv);

function help() {
  console.log(`Usage :-
$ ./todo add "todo item"  # Add a new todo
$ ./todo ls               # Show remaining todos
$ ./todo del NUMBER       # Delete a todo
$ ./todo done NUMBER      # Complete a todo
$ ./todo help             # Show usage
$ ./todo report           # Statistics`);
}

function add(description) {
  if (!description) {
    console.log(`Error: Missing todo string. Nothing added!`);
    return;
  }
  const todos = readList(TODO_FILENAME);
  const data = todos.length > 0 ? `\n${description}` : description;
  writeToList(TODO_FILENAME, data, `Added todo: "${description}"`);
}

function list() {
  const todos = readList(TODO_FILENAME);
  if (todos.length === 0) {
    console.log('There are no pending todos!');
  } else {
    todos.reverse().forEach((todo, index) => {
      console.log(`[${todos.length - index}] ${todo}`);
    });
  }
}

function statistics() {
  let date = new Date();
  const todoList = readList(TODO_FILENAME);
  const doneList = readList(DONE_FILENAME);
  console.log(
    `${date.toISOString().slice(0, 10)} Pending : ${todoList.length} Completed : ${doneList.length}`
  );
}

function deleteTodo(number) {
  if (!number) {
    console.log(`Error: Missing NUMBER for deleting todo.`);
    return;
  }
  const todos = readList(TODO_FILENAME);
  if (!todos[number - 1]) {
    // No matching
    console.log(`Error: todo #${number} does not exist. Nothing deleted.`);
    return;
  }

  // clear file
  fs.writeFileSync(TODO_FILENAME, '');
  todos.splice(number - 1, 1);
  todos.forEach((todo, index) => {
    if (index === 0) {
      writeToList(TODO_FILENAME, todo);
    } else {
      writeToList(TODO_FILENAME, `\n${todo}`);
    }
  });
  console.log(`Deleted todo #${number}`);
}

function doneTodo(number) {
  if (!number) {
    console.log(`Error: Missing NUMBER for marking todo as done.`);
    return;
  }
  const todos = readList(TODO_FILENAME);
  if (!todos[number - 1]) {
    // No matching
    console.log(`Error: todo #${number} does not exist.`);
    return;
  }

  const doneItem = todos.splice(number - 1, 1);
  let date = new Date();
  writeToList(
    DONE_FILENAME,
    `x ${date.toISOString().slice(0, 10)} ${doneItem}\n`,
    `Marked todo #${number} as done.`
  );

  // clear file and update list
  fs.writeFileSync(TODO_FILENAME, '');
  todos.forEach((todo) => {
    writeToList(TODO_FILENAME, todo);
  });
}

function readList(fileName) {
  let data;
  try {
    const content = fs.readFileSync(fileName, 'utf-8') || [];
    data = content.split('\n');
  } catch (err) {
    data = [];
  }
  return data;
}

function writeToList(fileName, data, message) {
  try {
    fs.writeFileSync(
      fileName,
      data,
      { flag: 'as+' } // append to file instead of overwriting
    );
  } catch (err) {
    if (err) console.log(err);
  }
  if (message) {
    console.log(message);
  }
}
