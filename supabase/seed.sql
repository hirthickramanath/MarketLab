insert into public.exchanges(id,name,country,timezone,currency) values
('XNSE','National Stock Exchange','India','Asia/Kolkata','INR'),
('XBOM','Bombay Stock Exchange','India','Asia/Kolkata','INR'),
('XNAS','Nasdaq','USA','America/New_York','USD'),
('XNYS','New York Stock Exchange','USA','America/New_York','USD'),
('XLON','London Stock Exchange','UK','Europe/London','GBP'),
('XTKS','Tokyo Stock Exchange','Japan','Asia/Tokyo','JPY') on conflict do nothing;
insert into public.instruments(exchange_id,symbol,name,currency,sector) values
('XNSE','RELIANCE','Reliance Industries','INR','Energy'),('XNSE','TCS','Tata Consultancy Services','INR','Technology'),('XNAS','AAPL','Apple','USD','Technology'),('XNAS','NVDA','NVIDIA','USD','Technology'),('XLON','AZN','AstraZeneca','GBP','Healthcare'),('XTKS','7203','Toyota Motor','JPY','Consumer') on conflict do nothing;
-- No invented price, financial statement, or news rows are inserted.
