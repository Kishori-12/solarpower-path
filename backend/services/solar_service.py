# Assumptions
COST_PER_KW = 50000          # INR per kW installation cost
ELECTRICITY_RATE = 8         # INR per unit (kWh)
PANEL_WATT = 400             # Watts per panel
SQM_PER_KW = 8              # Roof area (sqm) needed per kW
SYSTEM_EFFICIENCY = 0.80     # 80% efficiency (inverter + wiring losses)

# Peak sunlight hours by region (hours/day)
SUNLIGHT_HOURS = {
    "north": 4.5,    # Delhi, Punjab, UP
    "south": 5.5,    # Tamil Nadu, Kerala, Karnataka
    "east": 4.8,     # West Bengal, Odisha
    "west": 5.8,     # Rajasthan, Gujarat
    "central": 5.2   # MP, Maharashtra
}


def calculate_solar(roof_area, location, monthly_bill):
    # Step 1: Daily consumption from monthly bill
    daily_consumption_units = (monthly_bill / ELECTRICITY_RATE) / 30  # kWh/day

    # Step 2: Required system size based on consumption
    peak_hours = SUNLIGHT_HOURS.get(location.lower(), 5.0)
    required_capacity_kw = round(daily_consumption_units / (peak_hours * SYSTEM_EFFICIENCY), 2)

    # Step 3: Max capacity the roof can support
    max_roof_capacity_kw = round(roof_area / SQM_PER_KW, 2)

    # Step 4: Final recommended capacity (capped by roof size)
    recommended_capacity_kw = round(min(required_capacity_kw, max_roof_capacity_kw), 2)
    roof_limited = recommended_capacity_kw < required_capacity_kw

    # Step 5: Installation cost
    installation_cost = round(recommended_capacity_kw * COST_PER_KW)

    # Step 6: Actual generation from recommended system
    daily_generation_units = round(recommended_capacity_kw * peak_hours * SYSTEM_EFFICIENCY, 2)
    monthly_generation_units = round(daily_generation_units * 30, 2)

    # Step 7: Monthly savings (capped at actual bill)
    monthly_savings = round(min(monthly_generation_units * ELECTRICITY_RATE, monthly_bill))
    annual_savings = monthly_savings * 12

    # Step 8: Payback period
    payback_years = round(installation_cost / annual_savings, 1) if annual_savings > 0 else None

    # Step 9: Panel count (400W panels)
    panels_needed = round(recommended_capacity_kw * 1000 / PANEL_WATT)

    # Step 10: CO2 offset (0.82 kg CO2 per kWh, India grid average)
    co2_offset_kg_per_year = round(daily_generation_units * 365 * 0.82)

    return {
        "inputs": {
            "monthly_bill_inr": monthly_bill,
            "location": location,
            "roof_area_sqm": roof_area
        },
        "system": {
            "recommended_capacity_kw": recommended_capacity_kw,
            "required_capacity_kw": required_capacity_kw,
            "max_roof_capacity_kw": max_roof_capacity_kw,
            "roof_size_limited": roof_limited,
            "panels_needed": panels_needed,
            "peak_sunlight_hours_per_day": peak_hours
        },
        "financials": {
            "installation_cost_inr": installation_cost,
            "monthly_savings_inr": monthly_savings,
            "annual_savings_inr": annual_savings,
            "payback_period_years": payback_years,
            "roi_percent": round((annual_savings / installation_cost) * 100, 1) if installation_cost > 0 else 0
        },
        "generation": {
            "daily_generation_units": daily_generation_units,
            "monthly_generation_units": monthly_generation_units,
            "annual_generation_units": round(daily_generation_units * 365, 2)
        },
        "environment": {
            "co2_offset_kg_per_year": co2_offset_kg_per_year,
            "trees_equivalent": round(co2_offset_kg_per_year / 21)
        }
    }
