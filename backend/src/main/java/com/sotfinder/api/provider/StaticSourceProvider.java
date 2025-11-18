package com.sotfinder.api.provider;

import com.sotfinder.api.model.RawSourceResult;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class StaticSourceProvider implements SourceProvider {

    private static final List<RawSourceResult> MOCK_DATA = List.of(
            new RawSourceResult("MDN Web Docs: JavaScript", "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "The official Mozilla Developer Network documentation for JavaScript."),
            new RawSourceResult("Java™ Platform, Standard Edition & Java Development Kit", "https://www.oracle.com/java/technologies/javase-jdk17-doc-downloads.html", "Official Oracle documentation for Java 17."),
            new RawSourceResult("OpenJDK", "https://openjdk.org/", "The official website for the OpenJDK project."),
            new RawSourceResult("ECMAScript® 2025 Language Specification", "https://tc39.es/ecma262/", "The official specification for the JavaScript language."),
            new RawSourceResult("Ecma International", "https://www.ecma-international.org/", "Homepage of the standards organization for information and communication systems.")
    );

    @Override
    public List<RawSourceResult> fetchRawResults(String query) {
        String lowerCaseQuery = query.toLowerCase();
        return MOCK_DATA.stream()
                .filter(result -> result.title().toLowerCase().contains(lowerCaseQuery) ||
                                 result.description().toLowerCase().contains(lowerCaseQuery))
                .collect(Collectors.toList());
    }
}