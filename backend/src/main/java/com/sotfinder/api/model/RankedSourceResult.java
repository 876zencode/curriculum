package com.sotfinder.api.model;

public record RankedSourceResult(String title, String url, int authorityScore, String reason) {
}