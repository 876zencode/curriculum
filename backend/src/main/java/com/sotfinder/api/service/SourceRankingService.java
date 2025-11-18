package com.sotfinder.api.service;

import com.sotfinder.api.model.RawSourceResult;
import com.sotfinder.api.model.RankedSourceResult;
import org.springframework.stereotype.Service;

@Service
public class SourceRankingService {

    public RankedSourceResult rank(RawSourceResult rawResult) {
        int score = 0;
        StringBuilder reason = new StringBuilder();

        if (rawResult.url().contains("oracle.com") || rawResult.url().contains("openjdk.org") || rawResult.url().contains("developer.mozilla.org") || rawResult.url().contains("ecma-international.org")) {
            score += 10;
            reason.append("Official steward domain. ");
        }
        if (rawResult.title().toLowerCase().contains("specification") || rawResult.title().toLowerCase().contains("reference")) {
            score += 5;
            reason.append("Title contains 'specification' or 'reference'. ");
        }
        if (rawResult.description().toLowerCase().contains("official")) {
            score += 3;
            reason.append("Description contains 'official'. ");
        }

        return new RankedSourceResult(rawResult.title(), rawResult.url(), score, reason.toString().trim());
    }
}