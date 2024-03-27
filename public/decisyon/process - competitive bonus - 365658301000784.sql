



--\* Creazione tabella per il calcolo delle metriche:[ricavo_idrapp_5_emiliana_2022, costo_idrapp_5_emiliana_2022] */
CREATE TABLE decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/> AS SELECT
   ZonaVenditaCM260.id_AreaVenditaCM as HEAD_AREA_ID,ZonaVenditaCM260.Descrizione as HEAD_AREA_DS,
   ZonaVenditaCM260.id as HEAD_ZONA_ID,ZonaVenditaCM260.Codice as HEAD_ZONA_DS,
   Azienda261.CodDealerCM as HEAD_CODDEALER_ID,Azienda261.CodDealerCM as HEAD_CODDEALER_DS,
   Azienda261.id as HEAD_AZIENDA_ID,Azienda261.descrizione as HEAD_AZIENDA_DS,
   ZonaVenditaCM260.id_AreaVenditaCM as HEAD_AREA_PB_ID,ZonaVenditaCM260.Descrizione as HEAD_AREA_PB_DS,
   Azienda261.id_ZonaVenditaCM as HEAD_ZONA_PB_ID,ZonaVenditaCM260.Codice as HEAD_ZONA_PB_DS,
   Azienda261.CodDealerCM as HEAD_CODDEALER_PB_ID,Azienda261.CodDealerCM as HEAD_CODDEALER_PB_DS,
   DocVenditaDettaglio.id_Azienda as HEAD_AZIENDA_PB_ID,Azienda261.descrizione as HEAD_AZIENDA_PB_DS,
   LK_QUARTER576.ID_YEAR as YEAR_ID,LK_YEAR577.DSS_YEAR as YEAR_DS,
   LK_MONTH575.ID_QUARTER as QUARTER_ID,LK_QUARTER576.DSS_QUARTER as QUARTER_DS,
   LK_DATE.ID_MONTH as MONTH_ID,LK_MONTH575.DSL_MONTH as MONTH_DS,
   CodTipoRicambio72.Codice as CODICEMLI_ID,BasketMLIAnnuo70.CodiceMLI as CODICEMLI_DS,
    NVL(SUM(DocVenditaDettaglio.NettoRiga),0)  AS RICAVO_5_EMILIANA_,
    NVL(SUM((   DocVenditaDettaglio.PrzMedioPond  *  DocVenditaDettaglio.Quantita   )),0)  AS COSTO_5_EMILIANA_2022_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda261,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda301,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.BasketMLIAnnuo BasketMLIAnnuo70,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodMarcaRicambi CodMarcaRicambi375,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodSedeDealer CodSedeDealer303,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodTipoRicambio CodTipoRicambio72,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH575,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER576,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR577,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.ZonaVenditaCM ZonaVenditaCM260
 WHERE
   (    Azienda301.IsDealer = 1  AND  Azienda301.CodMercato = 'IT'  AND  Azienda301.Id_CasaMadre = 1  )
   AND   (    DocVenditaDettaglio.CancellatStampa = 'S'  )
   AND   (    DocVenditaDettaglio.id_RapportoClienteCM = 5 )
   AND   (    DocVenditaIntestazione.FlagAnnullata = 'A'  )
   AND   (    DocVenditaIntestazione.VAT = 'IT01155510397'  )
   AND   (    LK_MONTH575.ID_QUARTER >= 202201  )
   AND   (   BasketMLIAnnuo70.CodiceMercato = 'IT'  AND CodTipoRicambio72.Codice IN( '002' , '010' , '027' , '029' , '385' , '036' , '060' , '068' , '069' , '085' , '087' , '100' , '102' , '103' , '109' , '119' , '122' , '124' , '127' , '129' , '132' , '139' , '141' , '146' , '148' , '149' , '158' , '164' , '165' , '187' , '192' , '193' , '195' , '198' , '204' , '219' , '229' , '285' , '329' , '415' , '426' , '427' , '456' , '502' , '506' , '507' , '508' , '553' , '558' , '567' , '650' , '685' )  )
   AND   (   CodMarcaRicambi375.Codice = 'FO'  )
   AND   (   LK_DATE.ID_MONTH >= 201901  )
   AND   Azienda301.id=CodSedeDealer303.id_Azienda
   AND   BasketMLIAnnuo70.CodiceMLI=CodTipoRicambio72.Codice
   AND   CodSedeDealer303.id=DocVenditaIntestazione.id_CodSedeDealer
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.Id_CodTipoRicambio=CodTipoRicambio72.id
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=Azienda261.id
   AND   DocVenditaDettaglio.id_Azienda=CodMarcaRicambi375.id_Azienda
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaDettaglio.id_CodMarcaRicambi=CodMarcaRicambi375.id
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_MONTH575.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER576.ID_QUARTER=LK_MONTH575.ID_QUARTER
   AND   LK_YEAR577.ID_YEAR=LK_QUARTER576.ID_YEAR
   AND   ZonaVenditaCM260.id=Azienda261.id_ZonaVenditaCM
GROUP BY
   ZonaVenditaCM260.id_AreaVenditaCM,
   ZonaVenditaCM260.Descrizione,
   ZonaVenditaCM260.id,
   ZonaVenditaCM260.Codice,
   Azienda261.CodDealerCM,
   Azienda261.id,
   Azienda261.descrizione,
   Azienda261.id_ZonaVenditaCM,
   DocVenditaDettaglio.id_Azienda,
   LK_QUARTER576.ID_YEAR,
   LK_YEAR577.DSS_YEAR,
   LK_MONTH575.ID_QUARTER,
   LK_QUARTER576.DSS_QUARTER,
   LK_DATE.ID_MONTH,
   LK_MONTH575.DSL_MONTH,
   CodTipoRicambio72.Codice,
   BasketMLIAnnuo70.CodiceMLI
;




--\* Creazione tabella per il calcolo delle metriche:[ricavo_idrapp_4_Trader_2022, costo_idrapp_4_trader_2022] */
CREATE TABLE decisyon_cache.DX17115334276945072@<AUTOMOTIVE_BI_DATA/> AS SELECT
   ZonaVenditaCM260.id_AreaVenditaCM as HEAD_AREA_ID,ZonaVenditaCM260.Descrizione as HEAD_AREA_DS,
   ZonaVenditaCM260.id as HEAD_ZONA_ID,ZonaVenditaCM260.Codice as HEAD_ZONA_DS,
   Azienda261.CodDealerCM as HEAD_CODDEALER_ID,Azienda261.CodDealerCM as HEAD_CODDEALER_DS,
   Azienda261.id as HEAD_AZIENDA_ID,Azienda261.descrizione as HEAD_AZIENDA_DS,
   ZonaVenditaCM260.id_AreaVenditaCM as HEAD_AREA_PB_ID,ZonaVenditaCM260.Descrizione as HEAD_AREA_PB_DS,
   Azienda261.id_ZonaVenditaCM as HEAD_ZONA_PB_ID,ZonaVenditaCM260.Codice as HEAD_ZONA_PB_DS,
   Azienda261.CodDealerCM as HEAD_CODDEALER_PB_ID,Azienda261.CodDealerCM as HEAD_CODDEALER_PB_DS,
   DocVenditaDettaglio.id_Azienda as HEAD_AZIENDA_PB_ID,Azienda261.descrizione as HEAD_AZIENDA_PB_DS,
   LK_QUARTER576.ID_YEAR as YEAR_ID,LK_YEAR577.DSS_YEAR as YEAR_DS,
   LK_MONTH575.ID_QUARTER as QUARTER_ID,LK_QUARTER576.DSS_QUARTER as QUARTER_DS,
   LK_DATE.ID_MONTH as MONTH_ID,LK_MONTH575.DSL_MONTH as MONTH_DS,
   CodTipoRicambio72.Codice as CODICEMLI_ID,BasketMLIAnnuo70.CodiceMLI as CODICEMLI_DS,
    NVL(SUM(DocVenditaDettaglio.NettoRiga),0)  AS RICAVO_TRADER_2022_,
    NVL(SUM((   DocVenditaDettaglio.PrzMedioPond  *  DocVenditaDettaglio.Quantita   )),0)  AS COSTO_TRADER_2022_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda261,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda301,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.BasketMLIAnnuo BasketMLIAnnuo70,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodMarcaRicambi CodMarcaRicambi375,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodSedeDealer CodSedeDealer303,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodTipoRicambio CodTipoRicambio72,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH575,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER576,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR577,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.ZonaVenditaCM ZonaVenditaCM260
 WHERE
   (    Azienda301.IsDealer = 1  AND  Azienda301.CodMercato = 'IT'  AND  Azienda301.Id_CasaMadre = 1  )
   AND   (    DocVenditaDettaglio.CancellatStampa = 'S'  )
   AND   (    DocVenditaDettaglio.id_RapportoClienteCM = 4  )
   AND   (    DocVenditaIntestazione.FlagAnnullata = 'A'  )
   AND   (   BasketMLIAnnuo70.CodiceMercato = 'IT'  AND CodTipoRicambio72.Codice IN( '002' , '010' , '027' , '029' , '385' , '036' , '060' , '068' , '069' , '085' , '087' , '100' , '102' , '103' , '109' , '119' , '122' , '124' , '127' , '129' , '132' , '139' , '141' , '146' , '148' , '149' , '158' , '164' , '165' , '187' , '192' , '193' , '195' , '198' , '204' , '219' , '229' , '285' , '329' , '415' , '426' , '427' , '456' , '502' , '506' , '507' , '508' , '553' , '558' , '567' , '650' , '685' )  )
   AND   (   CodMarcaRicambi375.Codice = 'FO'  )
   AND   (   LK_DATE.ID_MONTH >= 201901  )
   AND   (   LK_DATE.ID_MONTH >= 202110  )
   AND   (   substr( DocVenditaIntestazione.VAT , 3 )   IN ( '01967930890' , '01468910888' , '01180330092' , '03540260043' , '03295630044' , '00105830194' , '02553340841' , '02154980995' , '01417270889' , '01731360887' , '02293000044' , '01394120883' , '02866340041' ) AND ( DocVenditaDettaglio.id_RapportoClienteCM = 4 )  )
   AND   Azienda301.id=CodSedeDealer303.id_Azienda
   AND   BasketMLIAnnuo70.CodiceMLI=CodTipoRicambio72.Codice
   AND   CodSedeDealer303.id=DocVenditaIntestazione.id_CodSedeDealer
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.Id_CodTipoRicambio=CodTipoRicambio72.id
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=Azienda261.id
   AND   DocVenditaDettaglio.id_Azienda=CodMarcaRicambi375.id_Azienda
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaDettaglio.id_CodMarcaRicambi=CodMarcaRicambi375.id
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_MONTH575.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER576.ID_QUARTER=LK_MONTH575.ID_QUARTER
   AND   LK_YEAR577.ID_YEAR=LK_QUARTER576.ID_YEAR
   AND   ZonaVenditaCM260.id=Azienda261.id_ZonaVenditaCM
GROUP BY
   ZonaVenditaCM260.id_AreaVenditaCM,
   ZonaVenditaCM260.Descrizione,
   ZonaVenditaCM260.id,
   ZonaVenditaCM260.Codice,
   Azienda261.CodDealerCM,
   Azienda261.id,
   Azienda261.descrizione,
   Azienda261.id_ZonaVenditaCM,
   DocVenditaDettaglio.id_Azienda,
   LK_QUARTER576.ID_YEAR,
   LK_YEAR577.DSS_YEAR,
   LK_MONTH575.ID_QUARTER,
   LK_QUARTER576.DSS_QUARTER,
   LK_DATE.ID_MONTH,
   LK_MONTH575.DSL_MONTH,
   CodTipoRicambio72.Codice,
   BasketMLIAnnuo70.CodiceMLI
;




--\* Creazione tabella per il calcolo delle metriche:[ricavo_idrapp_4NoTrader_2021, costo_idrapp_4_notrader_2021] */
CREATE TABLE decisyon_cache.DX17115334276965483@<AUTOMOTIVE_BI_DATA/> AS SELECT
   ZonaVenditaCM260.id_AreaVenditaCM as HEAD_AREA_ID,ZonaVenditaCM260.Descrizione as HEAD_AREA_DS,
   ZonaVenditaCM260.id as HEAD_ZONA_ID,ZonaVenditaCM260.Codice as HEAD_ZONA_DS,
   Azienda261.CodDealerCM as HEAD_CODDEALER_ID,Azienda261.CodDealerCM as HEAD_CODDEALER_DS,
   Azienda261.id as HEAD_AZIENDA_ID,Azienda261.descrizione as HEAD_AZIENDA_DS,
   ZonaVenditaCM260.id_AreaVenditaCM as HEAD_AREA_PB_ID,ZonaVenditaCM260.Descrizione as HEAD_AREA_PB_DS,
   Azienda261.id_ZonaVenditaCM as HEAD_ZONA_PB_ID,ZonaVenditaCM260.Codice as HEAD_ZONA_PB_DS,
   Azienda261.CodDealerCM as HEAD_CODDEALER_PB_ID,Azienda261.CodDealerCM as HEAD_CODDEALER_PB_DS,
   DocVenditaDettaglio.id_Azienda as HEAD_AZIENDA_PB_ID,Azienda261.descrizione as HEAD_AZIENDA_PB_DS,
   LK_QUARTER576.ID_YEAR as YEAR_ID,LK_YEAR577.DSS_YEAR as YEAR_DS,
   LK_MONTH575.ID_QUARTER as QUARTER_ID,LK_QUARTER576.DSS_QUARTER as QUARTER_DS,
   LK_DATE.ID_MONTH as MONTH_ID,LK_MONTH575.DSL_MONTH as MONTH_DS,
   CodTipoRicambio72.Codice as CODICEMLI_ID,BasketMLIAnnuo70.CodiceMLI as CODICEMLI_DS,
    NVL(SUM(DocVenditaDettaglio.NettoRiga),0)  AS RICAVO_4_NOTRADER_2021_,
    NVL(SUM((   DocVenditaDettaglio.PrzMedioPond  *  DocVenditaDettaglio.Quantita   )),0)  AS COSTO_4_NOTRADER_2021_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda261,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda301,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.BasketMLIAnnuo BasketMLIAnnuo70,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodMarcaRicambi CodMarcaRicambi375,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodSedeDealer CodSedeDealer303,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodTipoRicambio CodTipoRicambio72,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH575,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER576,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR577,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.ZonaVenditaCM ZonaVenditaCM260
 WHERE
   (    Azienda301.IsDealer = 1  AND  Azienda301.CodMercato = 'IT'  AND  Azienda301.Id_CasaMadre = 1  )
   AND   (    DocVenditaDettaglio.CancellatStampa = 'S'  )
   AND   (    DocVenditaDettaglio.id_RapportoClienteCM = 4  )
   AND   (    DocVenditaIntestazione.FlagAnnullata = 'A'  )
   AND   (   BasketMLIAnnuo70.CodiceMercato = 'IT'  AND CodTipoRicambio72.Codice IN( '002' , '010' , '027' , '029' , '385' , '036' , '060' , '068' , '069' , '085' , '087' , '100' , '102' , '103' , '109' , '119' , '122' , '124' , '127' , '129' , '132' , '139' , '141' , '146' , '148' , '149' , '158' , '164' , '165' , '187' , '192' , '193' , '195' , '198' , '204' , '219' , '229' , '285' , '329' , '415' , '426' , '427' , '456' , '502' , '506' , '507' , '508' , '553' , '558' , '567' , '650' , '685' )  )
   AND   (   CodMarcaRicambi375.Codice = 'FO'  )
   AND   (   LK_DATE.ID_MONTH >= 201901  )
   AND   (   substr( DocVenditaIntestazione.VAT , 3 )   NOT IN ( '01062790884' , '01111270888' , '02889410045' , '04911190488' , '09704470013' , '03740811207' , '06151590012' , '01924961004' , '02728000122' , '11464970968' , '294210728'  ) AND ( DocVenditaDettaglio.id_RapportoClienteCM = 4 AND DocVenditaIntestazione.id_CodCatAteco NOT IN ( 1071 , 525 , 722 , 1081 )  )  )
   AND   Azienda301.id=CodSedeDealer303.id_Azienda
   AND   BasketMLIAnnuo70.CodiceMLI=CodTipoRicambio72.Codice
   AND   CodSedeDealer303.id=DocVenditaIntestazione.id_CodSedeDealer
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.Id_CodTipoRicambio=CodTipoRicambio72.id
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=Azienda261.id
   AND   DocVenditaDettaglio.id_Azienda=CodMarcaRicambi375.id_Azienda
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaDettaglio.id_CodMarcaRicambi=CodMarcaRicambi375.id
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_MONTH575.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER576.ID_QUARTER=LK_MONTH575.ID_QUARTER
   AND   LK_YEAR577.ID_YEAR=LK_QUARTER576.ID_YEAR
   AND   ZonaVenditaCM260.id=Azienda261.id_ZonaVenditaCM
GROUP BY
   ZonaVenditaCM260.id_AreaVenditaCM,
   ZonaVenditaCM260.Descrizione,
   ZonaVenditaCM260.id,
   ZonaVenditaCM260.Codice,
   Azienda261.CodDealerCM,
   Azienda261.id,
   Azienda261.descrizione,
   Azienda261.id_ZonaVenditaCM,
   DocVenditaDettaglio.id_Azienda,
   LK_QUARTER576.ID_YEAR,
   LK_YEAR577.DSS_YEAR,
   LK_MONTH575.ID_QUARTER,
   LK_QUARTER576.DSS_QUARTER,
   LK_DATE.ID_MONTH,
   LK_MONTH575.DSL_MONTH,
   CodTipoRicambio72.Codice,
   BasketMLIAnnuo70.CodiceMLI
;




--\* Creazione tabella per il calcolo delle metriche:[ricavo_idrapporto_2, costo_idrapporto_2] */
CREATE TABLE decisyon_cache.DX17115334277267574@<AUTOMOTIVE_BI_DATA/> AS SELECT
   ZonaVenditaCM260.id_AreaVenditaCM as HEAD_AREA_ID,ZonaVenditaCM260.Descrizione as HEAD_AREA_DS,
   ZonaVenditaCM260.id as HEAD_ZONA_ID,ZonaVenditaCM260.Codice as HEAD_ZONA_DS,
   Azienda261.CodDealerCM as HEAD_CODDEALER_ID,Azienda261.CodDealerCM as HEAD_CODDEALER_DS,
   Azienda261.id as HEAD_AZIENDA_ID,Azienda261.descrizione as HEAD_AZIENDA_DS,
   ZonaVenditaCM260.id_AreaVenditaCM as HEAD_AREA_PB_ID,ZonaVenditaCM260.Descrizione as HEAD_AREA_PB_DS,
   Azienda261.id_ZonaVenditaCM as HEAD_ZONA_PB_ID,ZonaVenditaCM260.Codice as HEAD_ZONA_PB_DS,
   Azienda261.CodDealerCM as HEAD_CODDEALER_PB_ID,Azienda261.CodDealerCM as HEAD_CODDEALER_PB_DS,
   DocVenditaDettaglio.id_Azienda as HEAD_AZIENDA_PB_ID,Azienda261.descrizione as HEAD_AZIENDA_PB_DS,
   LK_QUARTER576.ID_YEAR as YEAR_ID,LK_YEAR577.DSS_YEAR as YEAR_DS,
   LK_MONTH575.ID_QUARTER as QUARTER_ID,LK_QUARTER576.DSS_QUARTER as QUARTER_DS,
   LK_DATE.ID_MONTH as MONTH_ID,LK_MONTH575.DSL_MONTH as MONTH_DS,
   CodTipoRicambio72.Codice as CODICEMLI_ID,BasketMLIAnnuo70.CodiceMLI as CODICEMLI_DS,
    NVL(SUM(DocVenditaDettaglio.NettoRiga),0)  AS RICAVO_IDRAPPORTO_2_,
    NVL(SUM((   DocVenditaDettaglio.PrzMedioPond  *  DocVenditaDettaglio.Quantita   )),0)  AS COSTO_IDRAPPORTO_2_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda261,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda301,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.BasketMLIAnnuo BasketMLIAnnuo70,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodMarcaRicambi CodMarcaRicambi375,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodSedeDealer CodSedeDealer303,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodTipoRicambio CodTipoRicambio72,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH575,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER576,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR577,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.ZonaVenditaCM ZonaVenditaCM260
 WHERE
   (    Azienda301.IsDealer = 1  AND  Azienda301.CodMercato = 'IT'  AND  Azienda301.Id_CasaMadre = 1  )
   AND   (    DocVenditaDettaglio.CancellatStampa = 'S'  )
   AND   (    DocVenditaDettaglio.id_RapportoClienteCM = 2  )
   AND   (    DocVenditaIntestazione.FlagAnnullata = 'A'  )
   AND   (   BasketMLIAnnuo70.CodiceMercato = 'IT'  AND CodTipoRicambio72.Codice IN( '002' , '010' , '027' , '029' , '385' , '036' , '060' , '068' , '069' , '085' , '087' , '100' , '102' , '103' , '109' , '119' , '122' , '124' , '127' , '129' , '132' , '139' , '141' , '146' , '148' , '149' , '158' , '164' , '165' , '187' , '192' , '193' , '195' , '198' , '204' , '219' , '229' , '285' , '329' , '415' , '426' , '427' , '456' , '502' , '506' , '507' , '508' , '553' , '558' , '567' , '650' , '685' )  )
   AND   (   CodMarcaRicambi375.Codice = 'FO'  )
   AND   (   LK_DATE.ID_MONTH >= 201901  )
   AND   Azienda301.id=CodSedeDealer303.id_Azienda
   AND   BasketMLIAnnuo70.CodiceMLI=CodTipoRicambio72.Codice
   AND   CodSedeDealer303.id=DocVenditaIntestazione.id_CodSedeDealer
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.Id_CodTipoRicambio=CodTipoRicambio72.id
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=Azienda261.id
   AND   DocVenditaDettaglio.id_Azienda=CodMarcaRicambi375.id_Azienda
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaDettaglio.id_CodMarcaRicambi=CodMarcaRicambi375.id
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_MONTH575.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER576.ID_QUARTER=LK_MONTH575.ID_QUARTER
   AND   LK_YEAR577.ID_YEAR=LK_QUARTER576.ID_YEAR
   AND   ZonaVenditaCM260.id=Azienda261.id_ZonaVenditaCM
GROUP BY
   ZonaVenditaCM260.id_AreaVenditaCM,
   ZonaVenditaCM260.Descrizione,
   ZonaVenditaCM260.id,
   ZonaVenditaCM260.Codice,
   Azienda261.CodDealerCM,
   Azienda261.id,
   Azienda261.descrizione,
   Azienda261.id_ZonaVenditaCM,
   DocVenditaDettaglio.id_Azienda,
   LK_QUARTER576.ID_YEAR,
   LK_YEAR577.DSS_YEAR,
   LK_MONTH575.ID_QUARTER,
   LK_QUARTER576.DSS_QUARTER,
   LK_DATE.ID_MONTH,
   LK_MONTH575.DSL_MONTH,
   CodTipoRicambio72.Codice,
   BasketMLIAnnuo70.CodiceMLI
;




--\* Creazione tabella per il calcolo delle metriche:[costo_idrapporto_6] */
CREATE TABLE decisyon_cache.DX17115334277268205@<AUTOMOTIVE_BI_DATA/> AS SELECT
   ZonaVenditaCM260.id_AreaVenditaCM as HEAD_AREA_ID,ZonaVenditaCM260.Descrizione as HEAD_AREA_DS,
   ZonaVenditaCM260.id as HEAD_ZONA_ID,ZonaVenditaCM260.Codice as HEAD_ZONA_DS,
   Azienda261.CodDealerCM as HEAD_CODDEALER_ID,Azienda261.CodDealerCM as HEAD_CODDEALER_DS,
   Azienda261.id as HEAD_AZIENDA_ID,Azienda261.descrizione as HEAD_AZIENDA_DS,
   ZonaVenditaCM260.id_AreaVenditaCM as HEAD_AREA_PB_ID,ZonaVenditaCM260.Descrizione as HEAD_AREA_PB_DS,
   Azienda261.id_ZonaVenditaCM as HEAD_ZONA_PB_ID,ZonaVenditaCM260.Codice as HEAD_ZONA_PB_DS,
   Azienda261.CodDealerCM as HEAD_CODDEALER_PB_ID,Azienda261.CodDealerCM as HEAD_CODDEALER_PB_DS,
   DocVenditaDettaglio.id_Azienda as HEAD_AZIENDA_PB_ID,Azienda261.descrizione as HEAD_AZIENDA_PB_DS,
   LK_QUARTER576.ID_YEAR as YEAR_ID,LK_YEAR577.DSS_YEAR as YEAR_DS,
   LK_MONTH575.ID_QUARTER as QUARTER_ID,LK_QUARTER576.DSS_QUARTER as QUARTER_DS,
   LK_DATE.ID_MONTH as MONTH_ID,LK_MONTH575.DSL_MONTH as MONTH_DS,
   CodTipoRicambio72.Codice as CODICEMLI_ID,BasketMLIAnnuo70.CodiceMLI as CODICEMLI_DS,
    NVL(SUM((   DocVenditaDettaglio.PrzMedioPond  *  DocVenditaDettaglio.Quantita   )),0)  AS COSTO_IDRAPPORTO_6_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda261,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda301,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.BasketMLIAnnuo BasketMLIAnnuo70,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodMarcaRicambi CodMarcaRicambi375,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodSedeDealer CodSedeDealer303,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodTipoRicambio CodTipoRicambio72,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH575,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER576,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR577,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.TipoMovimento TipoMovimento314,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.ZonaVenditaCM ZonaVenditaCM260
 WHERE
   (    Azienda301.IsDealer = 1  AND  Azienda301.CodMercato = 'IT'  AND  Azienda301.Id_CasaMadre = 1  )
   AND   (    DocVenditaDettaglio.CancellatStampa = 'S'  )
   AND   (    DocVenditaDettaglio.id_RapportoClienteCM = 6   OR TipoMovimento314.IsFleetDich = 1 OR TipoMovimento314.isServicePackDich = 1  )
   AND   (    DocVenditaIntestazione.FlagAnnullata = 'A'  )
   AND   (   BasketMLIAnnuo70.CodiceMercato = 'IT'  AND CodTipoRicambio72.Codice IN( '002' , '010' , '027' , '029' , '385' , '036' , '060' , '068' , '069' , '085' , '087' , '100' , '102' , '103' , '109' , '119' , '122' , '124' , '127' , '129' , '132' , '139' , '141' , '146' , '148' , '149' , '158' , '164' , '165' , '187' , '192' , '193' , '195' , '198' , '204' , '219' , '229' , '285' , '329' , '415' , '426' , '427' , '456' , '502' , '506' , '507' , '508' , '553' , '558' , '567' , '650' , '685' )  )
   AND   (   CodMarcaRicambi375.Codice = 'FO'  )
   AND   (   LK_DATE.ID_MONTH >= 201901  )
   AND   Azienda301.id=CodSedeDealer303.id_Azienda
   AND   BasketMLIAnnuo70.CodiceMLI=CodTipoRicambio72.Codice
   AND   CodSedeDealer303.id=DocVenditaIntestazione.id_CodSedeDealer
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.Id_CodTipoRicambio=CodTipoRicambio72.id
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=Azienda261.id
   AND   DocVenditaDettaglio.id_Azienda=CodMarcaRicambi375.id_Azienda
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaDettaglio.id_CodMarcaRicambi=CodMarcaRicambi375.id
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_MONTH575.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER576.ID_QUARTER=LK_MONTH575.ID_QUARTER
   AND   LK_YEAR577.ID_YEAR=LK_QUARTER576.ID_YEAR
   AND   TipoMovimento314.id=DocVenditaDettaglio.id_TipoMovimento
   AND   TipoMovimento314.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   ZonaVenditaCM260.id=Azienda261.id_ZonaVenditaCM
GROUP BY
   ZonaVenditaCM260.id_AreaVenditaCM,
   ZonaVenditaCM260.Descrizione,
   ZonaVenditaCM260.id,
   ZonaVenditaCM260.Codice,
   Azienda261.CodDealerCM,
   Azienda261.id,
   Azienda261.descrizione,
   Azienda261.id_ZonaVenditaCM,
   DocVenditaDettaglio.id_Azienda,
   LK_QUARTER576.ID_YEAR,
   LK_YEAR577.DSS_YEAR,
   LK_MONTH575.ID_QUARTER,
   LK_QUARTER576.DSS_QUARTER,
   LK_DATE.ID_MONTH,
   LK_MONTH575.DSL_MONTH,
   CodTipoRicambio72.Codice,
   BasketMLIAnnuo70.CodiceMLI
;




--\* Creazione tabella temporanea contenente i valori dimensionali */
CREATE TABLE decisyon_cache.UX17115334277264167@<AUTOMOTIVE_BI_DATA/> AS SELECT
 decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_ID AS HEAD_AREA_ID,decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_DS AS HEAD_AREA_DS,
 decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_ID AS HEAD_ZONA_ID,decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_DS AS HEAD_ZONA_DS,
 decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_ID AS HEAD_CODDEALER_ID,decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_DS AS HEAD_CODDEALER_DS,
 decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_ID AS HEAD_AZIENDA_ID,decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_DS AS HEAD_AZIENDA_DS,
 decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_PB_ID AS HEAD_AREA_PB_ID,decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_PB_DS AS HEAD_AREA_PB_DS,
 decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_PB_ID AS HEAD_ZONA_PB_ID,decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_PB_DS AS HEAD_ZONA_PB_DS,
 decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_PB_ID AS HEAD_CODDEALER_PB_ID,decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_PB_DS AS HEAD_CODDEALER_PB_DS,
 decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_PB_ID AS HEAD_AZIENDA_PB_ID,decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_PB_DS AS HEAD_AZIENDA_PB_DS,
 decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AS YEAR_ID,decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.YEAR_DS AS YEAR_DS,
 decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AS QUARTER_ID,decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.QUARTER_DS AS QUARTER_DS,
 decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.MONTH_ID AS MONTH_ID,decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.MONTH_DS AS MONTH_DS,
 decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.CODICEMLI_ID AS CODICEMLI_ID,decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.CODICEMLI_DS AS CODICEMLI_DS
FROM decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX17115334277264167@<AUTOMOTIVE_BI_DATA/>
(HEAD_AREA_ID,HEAD_AREA_DS,HEAD_ZONA_ID,HEAD_ZONA_DS,HEAD_CODDEALER_ID,HEAD_CODDEALER_DS,HEAD_AZIENDA_ID,HEAD_AZIENDA_DS,HEAD_AREA_PB_ID,HEAD_AREA_PB_DS,HEAD_ZONA_PB_ID,HEAD_ZONA_PB_DS,HEAD_CODDEALER_PB_ID,HEAD_CODDEALER_PB_DS,HEAD_AZIENDA_PB_ID,HEAD_AZIENDA_PB_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS,CODICEMLI_ID,CODICEMLI_DS)
 SELECT
HEAD_AREA_ID,HEAD_AREA_DS,HEAD_ZONA_ID,HEAD_ZONA_DS,HEAD_CODDEALER_ID,HEAD_CODDEALER_DS,HEAD_AZIENDA_ID,HEAD_AZIENDA_DS,HEAD_AREA_PB_ID,HEAD_AREA_PB_DS,HEAD_ZONA_PB_ID,HEAD_ZONA_PB_DS,HEAD_CODDEALER_PB_ID,HEAD_CODDEALER_PB_DS,HEAD_AZIENDA_PB_ID,HEAD_AZIENDA_PB_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS,CODICEMLI_ID,CODICEMLI_DS  FROM decisyon_cache.DX17115334276945072@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX17115334277264167@<AUTOMOTIVE_BI_DATA/>
(HEAD_AREA_ID,HEAD_AREA_DS,HEAD_ZONA_ID,HEAD_ZONA_DS,HEAD_CODDEALER_ID,HEAD_CODDEALER_DS,HEAD_AZIENDA_ID,HEAD_AZIENDA_DS,HEAD_AREA_PB_ID,HEAD_AREA_PB_DS,HEAD_ZONA_PB_ID,HEAD_ZONA_PB_DS,HEAD_CODDEALER_PB_ID,HEAD_CODDEALER_PB_DS,HEAD_AZIENDA_PB_ID,HEAD_AZIENDA_PB_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS,CODICEMLI_ID,CODICEMLI_DS)
 SELECT
HEAD_AREA_ID,HEAD_AREA_DS,HEAD_ZONA_ID,HEAD_ZONA_DS,HEAD_CODDEALER_ID,HEAD_CODDEALER_DS,HEAD_AZIENDA_ID,HEAD_AZIENDA_DS,HEAD_AREA_PB_ID,HEAD_AREA_PB_DS,HEAD_ZONA_PB_ID,HEAD_ZONA_PB_DS,HEAD_CODDEALER_PB_ID,HEAD_CODDEALER_PB_DS,HEAD_AZIENDA_PB_ID,HEAD_AZIENDA_PB_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS,CODICEMLI_ID,CODICEMLI_DS  FROM decisyon_cache.DX17115334276965483@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX17115334277264167@<AUTOMOTIVE_BI_DATA/>
(HEAD_AREA_ID,HEAD_AREA_DS,HEAD_ZONA_ID,HEAD_ZONA_DS,HEAD_CODDEALER_ID,HEAD_CODDEALER_DS,HEAD_AZIENDA_ID,HEAD_AZIENDA_DS,HEAD_AREA_PB_ID,HEAD_AREA_PB_DS,HEAD_ZONA_PB_ID,HEAD_ZONA_PB_DS,HEAD_CODDEALER_PB_ID,HEAD_CODDEALER_PB_DS,HEAD_AZIENDA_PB_ID,HEAD_AZIENDA_PB_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS,CODICEMLI_ID,CODICEMLI_DS)
 SELECT
HEAD_AREA_ID,HEAD_AREA_DS,HEAD_ZONA_ID,HEAD_ZONA_DS,HEAD_CODDEALER_ID,HEAD_CODDEALER_DS,HEAD_AZIENDA_ID,HEAD_AZIENDA_DS,HEAD_AREA_PB_ID,HEAD_AREA_PB_DS,HEAD_ZONA_PB_ID,HEAD_ZONA_PB_DS,HEAD_CODDEALER_PB_ID,HEAD_CODDEALER_PB_DS,HEAD_AZIENDA_PB_ID,HEAD_AZIENDA_PB_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS,CODICEMLI_ID,CODICEMLI_DS  FROM decisyon_cache.DX17115334277267574@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX17115334277264167@<AUTOMOTIVE_BI_DATA/>
(HEAD_AREA_ID,HEAD_AREA_DS,HEAD_ZONA_ID,HEAD_ZONA_DS,HEAD_CODDEALER_ID,HEAD_CODDEALER_DS,HEAD_AZIENDA_ID,HEAD_AZIENDA_DS,HEAD_AREA_PB_ID,HEAD_AREA_PB_DS,HEAD_ZONA_PB_ID,HEAD_ZONA_PB_DS,HEAD_CODDEALER_PB_ID,HEAD_CODDEALER_PB_DS,HEAD_AZIENDA_PB_ID,HEAD_AZIENDA_PB_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS,CODICEMLI_ID,CODICEMLI_DS)
 SELECT
HEAD_AREA_ID,HEAD_AREA_DS,HEAD_ZONA_ID,HEAD_ZONA_DS,HEAD_CODDEALER_ID,HEAD_CODDEALER_DS,HEAD_AZIENDA_ID,HEAD_AZIENDA_DS,HEAD_AREA_PB_ID,HEAD_AREA_PB_DS,HEAD_ZONA_PB_ID,HEAD_ZONA_PB_DS,HEAD_CODDEALER_PB_ID,HEAD_CODDEALER_PB_DS,HEAD_AZIENDA_PB_ID,HEAD_AZIENDA_PB_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS,CODICEMLI_ID,CODICEMLI_DS  FROM decisyon_cache.DX17115334277268205@<AUTOMOTIVE_BI_DATA/>;




--\* Creazione tabella temporanea finale contenente valori distinti */
CREATE TABLE decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/> AS SELECT DISTINCT
HEAD_AREA_ID,HEAD_AREA_DS,
HEAD_ZONA_ID,HEAD_ZONA_DS,
HEAD_CODDEALER_ID,HEAD_CODDEALER_DS,
HEAD_AZIENDA_ID,HEAD_AZIENDA_DS,
HEAD_AREA_PB_ID,HEAD_AREA_PB_DS,
HEAD_ZONA_PB_ID,HEAD_ZONA_PB_DS,
HEAD_CODDEALER_PB_ID,HEAD_CODDEALER_PB_DS,
HEAD_AZIENDA_PB_ID,HEAD_AZIENDA_PB_DS,
YEAR_ID,YEAR_DS,
QUARTER_ID,QUARTER_DS,
MONTH_ID,MONTH_DS,
CODICEMLI_ID,CODICEMLI_DS FROM decisyon_cache.UX17115334277264167@<AUTOMOTIVE_BI_DATA/>;




--\* Creazione del datamart finale */
CREATE TABLE decisyon_cache.FX17115334277416318@<AUTOMOTIVE_BI_DATA/> AS SELECT
   decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_ID,decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_DS,
   decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_ID,decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_DS,
   decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_ID,decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_DS,
   decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_ID,decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_DS,
   decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_PB_ID,decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_PB_DS,
   decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_PB_ID,decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_PB_DS,
   decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_PB_ID,decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_PB_DS,
   decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_PB_ID,decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_PB_DS,
   decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.YEAR_ID,decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.YEAR_DS,
   decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID,decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.QUARTER_DS,
   decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.MONTH_ID,decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.MONTH_DS,
   decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.CODICEMLI_ID,decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.CODICEMLI_DS,
    NVL(COSTO_4_NOTRADER_2021_,0)  AS COSTO_4_NOTRADER_2021_,
    NVL(RICAVO_5_EMILIANA_,0)  AS RICAVO_5_EMILIANA_,
    NVL(COSTO_TRADER_2022_,0)  AS COSTO_TRADER_2022_,
    NVL(COSTO_5_EMILIANA_2022_,0)  AS COSTO_5_EMILIANA_2022_,
    NVL(RICAVO_4_NOTRADER_2021_,0)  AS RICAVO_4_NOTRADER_2021_,
    NVL(RICAVO_TRADER_2022_,0)  AS RICAVO_TRADER_2022_,
    NVL(COSTO_IDRAPPORTO_6_,0)  AS COSTO_IDRAPPORTO_6_,
    NVL(COSTO_IDRAPPORTO_2_,0)  AS COSTO_IDRAPPORTO_2_,
    NVL(RICAVO_IDRAPPORTO_2_,0)  AS RICAVO_IDRAPPORTO_2_
FROM
   decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>
  left outer join decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_ID=decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_ID=decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_ID=decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_ID=decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_PB_ID=decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_PB_ID=decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_PB_ID=decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_PB_ID=decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.MONTH_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.CODICEMLI_ID=decisyon_cache.DX17115334276788441@<AUTOMOTIVE_BI_DATA/>.CODICEMLI_ID)
  left outer join decisyon_cache.DX17115334276945072@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_ID=decisyon_cache.DX17115334276945072@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_ID=decisyon_cache.DX17115334276945072@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_ID=decisyon_cache.DX17115334276945072@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_ID=decisyon_cache.DX17115334276945072@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_PB_ID=decisyon_cache.DX17115334276945072@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_PB_ID=decisyon_cache.DX17115334276945072@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_PB_ID=decisyon_cache.DX17115334276945072@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_PB_ID=decisyon_cache.DX17115334276945072@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX17115334276945072@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX17115334276945072@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX17115334276945072@<AUTOMOTIVE_BI_DATA/>.MONTH_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.CODICEMLI_ID=decisyon_cache.DX17115334276945072@<AUTOMOTIVE_BI_DATA/>.CODICEMLI_ID)
  left outer join decisyon_cache.DX17115334276965483@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_ID=decisyon_cache.DX17115334276965483@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_ID=decisyon_cache.DX17115334276965483@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_ID=decisyon_cache.DX17115334276965483@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_ID=decisyon_cache.DX17115334276965483@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_PB_ID=decisyon_cache.DX17115334276965483@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_PB_ID=decisyon_cache.DX17115334276965483@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_PB_ID=decisyon_cache.DX17115334276965483@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_PB_ID=decisyon_cache.DX17115334276965483@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX17115334276965483@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX17115334276965483@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX17115334276965483@<AUTOMOTIVE_BI_DATA/>.MONTH_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.CODICEMLI_ID=decisyon_cache.DX17115334276965483@<AUTOMOTIVE_BI_DATA/>.CODICEMLI_ID)
  left outer join decisyon_cache.DX17115334277267574@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_ID=decisyon_cache.DX17115334277267574@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_ID=decisyon_cache.DX17115334277267574@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_ID=decisyon_cache.DX17115334277267574@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_ID=decisyon_cache.DX17115334277267574@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_PB_ID=decisyon_cache.DX17115334277267574@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_PB_ID=decisyon_cache.DX17115334277267574@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_PB_ID=decisyon_cache.DX17115334277267574@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_PB_ID=decisyon_cache.DX17115334277267574@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX17115334277267574@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX17115334277267574@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX17115334277267574@<AUTOMOTIVE_BI_DATA/>.MONTH_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.CODICEMLI_ID=decisyon_cache.DX17115334277267574@<AUTOMOTIVE_BI_DATA/>.CODICEMLI_ID)
  left outer join decisyon_cache.DX17115334277268205@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_ID=decisyon_cache.DX17115334277268205@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_ID=decisyon_cache.DX17115334277268205@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_ID=decisyon_cache.DX17115334277268205@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_ID=decisyon_cache.DX17115334277268205@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_PB_ID=decisyon_cache.DX17115334277268205@<AUTOMOTIVE_BI_DATA/>.HEAD_AREA_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_PB_ID=decisyon_cache.DX17115334277268205@<AUTOMOTIVE_BI_DATA/>.HEAD_ZONA_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_PB_ID=decisyon_cache.DX17115334277268205@<AUTOMOTIVE_BI_DATA/>.HEAD_CODDEALER_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_PB_ID=decisyon_cache.DX17115334277268205@<AUTOMOTIVE_BI_DATA/>.HEAD_AZIENDA_PB_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX17115334277268205@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX17115334277268205@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX17115334277268205@<AUTOMOTIVE_BI_DATA/>.MONTH_ID AND
     decisyon_cache.UX17115334277264336@<AUTOMOTIVE_BI_DATA/>.CODICEMLI_ID=decisyon_cache.DX17115334277268205@<AUTOMOTIVE_BI_DATA/>.CODICEMLI_ID)
;




--\* Ricerca CubeView:[costo_idrapp_4_trader_2022, ricavo_idrapp_4_Trader_2022] */
;




--\* Ricerca CubeView:[costo_idrapporto_2, ricavo_idrapporto_2] */
;




--\* Ricerca CubeView:[costo_idrapp_4_notrader_2021, ricavo_idrapp_4NoTrader_2021] */
;




--\* Ricerca CubeView:[costo_idrapporto_6] */
;




--\* Ricerca CubeView:[costo_idrapp_5_emiliana_2022, ricavo_idrapp_5_emiliana_2022] */
;

