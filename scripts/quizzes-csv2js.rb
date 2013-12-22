#!/usr/bin/env ruby

require 'csv'
require 'json'

class Character
  def initialize
  end
end

source = ARGV[0]

current_char_name = nil

result = []

current_char_index = - 1

met_first_line = false

CSV.foreach source do |row|
  unless met_first_line
    met_first_line = true
    next
  end

  char_name, question, choice1, choice2, choice3, choice4, correct_choice_index = row

  choices = [choice1, choice2, choice3, choice4].take_while { |c| ! c.nil? }
  correct_choice_index = correct_choice_index.to_i - 1
  correct_choice = choices[correct_choice_index]

  if char_name
    current_char_index += 1
    result[current_char_index] = { name: char_name, quizzes: [] }
  end

  quiz = { text: question, choices: choices, correct_choice: correct_choice, correct_choice_index: correct_choice_index }

  result[current_char_index][:quizzes].push quiz
end

puts result.to_json
