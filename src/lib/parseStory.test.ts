import { describe, it, expect } from "vitest";
import { parseStoryResponse } from "./parseStory";

describe("parseStoryResponse", () => {
  it("parses clean JSON", () => {
    const out = parseStoryResponse(
      '{"title": "The Fox", "story": "Once upon a time..."}',
    );
    expect(out).toEqual({ title: "The Fox", story: "Once upon a time..." });
  });
  it("JSON wrapped in code fences", () => {
    const out = parseStoryResponse(
      '```json\n{"title": "The Fox", "story": "Once upon a time..."}\n```',
    );
    expect(out).toEqual({ title: "The Fox", story: "Once upon a time..." });
  });
  it("a <think> block before the JSON", () => {
    const out = parseStoryResponse(
      '<think>Thinking...</think>{"title": "The Fox", "story": "Once upon a time..."}',
    );
    expect(out).toEqual({ title: "The Fox", story: "Once upon a time..." });
  });
  it("the HTML escaped version of `&lt;think&gt;...&lt;/think&gt;`", () => {
    const out = parseStoryResponse(
      '&lt;think&gt;Thinking...&lt;/think&gt;{"title": "The Fox", "story": "Once upon a time..."}',
    );
    expect(out).toEqual({ title: "The Fox", story: "Once upon a time..." });
  });
  it("smart quotes instead of normal quotes", () => {
    const out = parseStoryResponse(
      '{“title”: “The Fox”, “story”: “Once upon a time..."}',
    );
    expect(out).toEqual({ title: "The Fox", story: "Once upon a time..." });
  });
  it("Extra text after the closing `}`", () => {
    const out = parseStoryResponse(
      '{"title": "The Fox", "story": "Once upon a time..."} Extra text here',
    );
    expect(out).toEqual({ title: "The Fox", story: "Once upon a time..." });
  });
  it("Slightly broken JSON (a trailing comma) that `jsonrepair` should fix", () => {
    const out = parseStoryResponse(
      '{"title": "The Fox", "story": "Once upon a time...",}',
    );
    expect(out).toEqual({ title: "The Fox", story: "Once upon a time..." });
  });
  it("Garbage with no JSON at all: should return title 'Your Story' and an empty story", () => {
    const out = parseStoryResponse("This is not JSON at all!");
    expect(out).toEqual({ title: "Your Story", story: "" });
  });
});
