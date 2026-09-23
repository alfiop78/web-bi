-- creazione datamart 21.10.2024

/*Creazione DATAMART :


decisyon_cache.WEB_BI_1729517052641_2


*/


CREATE TABLE decisyon_cache.WEB_BI_1729517052641_2 INCLUDE SCHEMA PRIVILEGES AS SELECT
union_1729517052641_2.Area_id,
union_1729517052641_2.Area,
union_1729517052641_2.Zona_id,
union_1729517052641_2.Zona,
union_1729517052641_2.CodDealerCM_id,
union_1729517052641_2.CodDealerCM,
union_1729517052641_2.Dealer_id,
union_1729517052641_2.Dealer,
union_1729517052641_2.basketMLI_id,
union_1729517052641_2.basketMLI,
union_1729517052641_2.WB_YEARS_id,
union_1729517052641_2.WB_YEARS,
union_1729517052641_2.WB_QUARTERS_id,
union_1729517052641_2.WB_QUARTERS,
union_1729517052641_2.WB_MONTHS_id,
union_1729517052641_2.WB_MONTHS,
NVL(costo_rapp_6, 0) AS 'costo_rapp_6',
NVL(costo_rapp_2, 0) AS 'costo_rapp_2',
NVL(ricavo_rapp_2, 0) AS 'ricavo_rapp_2',
NVL(costo_rapp_4_no_trader, 0) AS 'costo_rapp_4_no_trader',
NVL(ricavo_rapp_4_no_trader, 0) AS 'ricavo_rapp_4_no_trader',
NVL(costo_rapp_4_trader, 0) AS 'costo_rapp_4_trader',
NVL(ricavo_rapp_4_trader, 0) AS 'ricavo_rapp_4_trader',
NVL(costo_rapp_5_emiliana, 0) AS 'costo_rapp_5_emiliana',
NVL(ricavo_rapp_5_emiliana, 0) AS 'ricavo_rapp_5_emiliana',
(( NVL(ricavo_rapp_2,0) - NVL(costo_rapp_2,0) ) / NVL(ricavo_rapp_2,0) ) * 100 AS 'margine_rapporto_2',
( NVL(costo_rapp_4_no_trader,0) - NVL(costo_rapp_4_trader,0) + NVL(costo_rapp_5_emiliana,0) ) AS 'costo_ve_cb',
( NVL(ricavo_rapp_4_no_trader,0) - NVL(ricavo_rapp_4_trader,0) + NVL(ricavo_rapp_5_emiliana,0) ) AS 'ricavo_ve_cb',
(( ( NVL(ricavo_rapp_4_no_trader,0) - NVL(ricavo_rapp_4_trader,0) + NVL(ricavo_rapp_5_emiliana,0) ) - ( NVL(costo_rapp_4_no_trader,0) - NVL(costo_rapp_4_trader,0) + NVL(costo_rapp_5_emiliana,0) ) ) / ( NVL(ricavo_rapp_4_no_trader,0) - NVL(ricavo_rapp_4_trader,0) + NVL(ricavo_rapp_5_emiliana,0) ) ) * 100 AS 'marginalita'
