# Aerly Data Scripts

Scripts for one-shot or periodic data work, NOT runtime code.

## Naming convention

`NN_description.py` where NN is execution order.

## Examples

- `01_scrape_metar.py` — download 2 years METAR from Ogimet
- `02_parse_flight_schedule.py` — parse organizer PDF into CSV
- `03_train_fog_model.py` — train XGBoost models
- `04_validate_on_real_events.py` — validate model on known fog events

## Data conventions

- Raw data: `data/raw/`
- Processed: `data/processed/`
- Models: `apps/api/app/ml/models/`
- Reports: `docs/ml-validation-report.md`

## Don'ts

- Don't put DB credentials in scripts — read from `.env`
- Don't commit raw data files larger than 5MB
- Don't run scripts on production data
