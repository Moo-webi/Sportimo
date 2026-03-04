package com.muhammed.Sportimo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class LandingDataResponse {
    private long sportsCount;
    private long facilitiesCount;
    private long slotsCount;
    private long upcomingMatchesCount;
    private List<String> spotlightSports;
    private List<FeaturedFacilityDto> featuredFacilities;
    private List<UpcomingMatchDto> upcomingMatches;
}
