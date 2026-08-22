package service

import "testing"

func TestCleanTagsTrimsAndDedupsCaseInsensitively(t *testing.T) {
	got, err := cleanTags([]string{" React ", "react", "", "TypeScript", "TypeScript"})
	if err != nil {
		t.Fatalf("cleanTags: %v", err)
	}
	if len(got) != 2 {
		t.Fatalf("expected 2 tags, got %#v", got)
	}
	if got[0] != "React" {
		t.Fatalf("expected first tag to keep original casing, got %q", got[0])
	}
	if got[1] != "TypeScript" {
		t.Fatalf("expected second tag TypeScript, got %q", got[1])
	}
}

func TestCleanTagsPreservesDistinctExactNames(t *testing.T) {
	got, err := cleanTags([]string{"AI", "Machine Learning"})
	if err != nil {
		t.Fatalf("cleanTags: %v", err)
	}
	if len(got) != 2 || got[0] != "AI" || got[1] != "Machine Learning" {
		t.Fatalf("expected exact names preserved, got %#v", got)
	}
}

func TestCleanTagsRejectsMoreThanMax(t *testing.T) {
	_, err := cleanTags([]string{"a", "b", "c", "d", "e", "f", "g"})
	if err == nil {
		t.Fatal("expected validation error for too many tags")
	}
}
