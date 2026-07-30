namespace SanCRM.Application.DTOs;

public class CreateOpportunityDto
{
    public string Title { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public int? ContactId { get; set; }
    public int? LeadId { get; set; }
    public int? AssignedTo { get; set; }
    public string Stage { get; set; } = "Prospecting";
    public decimal Amount { get; set; } = 0;
    public string Currency { get; set; } = "INR";
    public byte Probability { get; set; } = 0;
    public string? ExpectedClose { get; set; }
    public string? Source { get; set; }
    public string? Type { get; set; }
    public string? Description { get; set; }
    public string? NextStep { get; set; }
}

public class UpdateOpportunityDto : CreateOpportunityDto
{
    public string? LostReason { get; set; }
    public string? LostTo { get; set; }
    public string? ActualClose { get; set; }
}

public class UpdateStageDto
{
    public string Stage { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? LostReason { get; set; }
    public string? LostTo { get; set; }
}

public class OpportunityListDto
{
    public int Id { get; set; }
    public string OppNo { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Stage { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public byte Probability { get; set; }
    public decimal WeightedValue { get; set; }
    public string? ExpectedClose { get; set; }
    public string? Company { get; set; }
    public int CompanyId { get; set; }
    public string? ContactName { get; set; }
    public string? AssignedTo { get; set; }
    public int? AssignedToId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class OpportunityDetailDto : OpportunityListDto
{
    public int? ContactId { get; set; }
    public int? LeadId { get; set; }
    public string? ActualClose { get; set; }
    public string? LostReason { get; set; }
    public string? LostTo { get; set; }
    public string? Source { get; set; }
    public string? Type { get; set; }
    public string? Description { get; set; }
    public string? NextStep { get; set; }
    public decimal? AiPrediction { get; set; }
    public AiPredictionDto? AiPredictionDetails { get; set; }
    public List<StageHistoryDto> StageHistory { get; set; } = new();
}

public class AiPredictionDto
{
    public decimal WinProbability { get; set; }
    public decimal ExpectedRevenue { get; set; }
    public string Recommendation { get; set; } = string.Empty;
    public List<string> KeyFactors { get; set; } = new();
}

public class StageHistoryDto
{
    public string? FromStage { get; set; }
    public string ToStage { get; set; } = string.Empty;
    public string? ChangedBy { get; set; }
    public string? Notes { get; set; }
    public DateTime ChangedAt { get; set; }
}

public class PipelineStatsDto
{
    public List<PipelineStageSummaryDto> Stages { get; set; } = new();
    public decimal TotalPipelineValue { get; set; }
    public decimal WeightedPipelineValue { get; set; }
    public int TotalDeals { get; set; }
    public decimal WinRate { get; set; }
    public decimal AvgDealSize { get; set; }
    public decimal AvgSaleCycleDays { get; set; }
}

public class PipelineStageSummaryDto
{
    public string Stage { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal TotalValue { get; set; }
    public decimal WeightedValue { get; set; }
    public decimal AvgProbability { get; set; }
}

public class ForecastDto
{
    public string Period { get; set; } = string.Empty;
    public decimal CommittedRevenue { get; set; }
    public decimal BestCase { get; set; }
    public decimal Pipeline { get; set; }
    public List<ForecastItemDto> Deals { get; set; } = new();
}

public class ForecastItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal Probability { get; set; }
    public decimal WeightedValue { get; set; }
    public string Stage { get; set; } = string.Empty;
    public string? ExpectedClose { get; set; }
    public string? AssignedTo { get; set; }
}

public class OpportunityStatsDto
{
    public int Total { get; set; }
    public int Open { get; set; }
    public int ClosedWon { get; set; }
    public int ClosedLost { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal WeightedPipeline { get; set; }
    public decimal WinRate { get; set; }
}
