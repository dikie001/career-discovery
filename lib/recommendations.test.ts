import test from "node:test"
import assert from "node:assert/strict"
import { extractRecommendationTitles } from "./recommendations"

test("extracts bolded and numbered career titles from AI responses", () => {
  const text = `Here are the best matches for you:\n\n**Data Analyst**\nWhy it fits: strong with analysis.\n\n1. Software Developer\n2. Product Manager`

  assert.deepEqual(extractRecommendationTitles(text), [
    "Data Analyst",
    "Software Developer",
    "Product Manager",
  ])
})

test("ignores generic labels and keeps the first five recommendations", () => {
  const text = `**Note**\n**Data Analyst**\n**Software Developer**\n**Product Manager**\n**UX Designer**\n**Marketing Specialist**`

  assert.deepEqual(extractRecommendationTitles(text), [
    "Data Analyst",
    "Software Developer",
    "Product Manager",
    "UX Designer",
    "Marketing Specialist",
  ])
})
