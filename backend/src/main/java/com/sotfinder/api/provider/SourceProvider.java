package com.sotfinder.api.provider;

import com.sotfinder.api.model.RawSourceResult;
import java.util.List;

public interface SourceProvider {
    List<RawSourceResult> fetchRawResults(String query);
}