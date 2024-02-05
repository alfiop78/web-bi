
--\* Creazione tabella per il calcolo delle metriche:[rCliCostoRATotale_2023] */
CREATE TABLE decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/> AS SELECT
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_ID,Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_DS,
   Azienda461.id as RCLI_A_DSAZIENDA_Q_ID,Azienda461.descrizione as RCLI_A_DSAZIENDA_Q_DS,
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_PB_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_PB_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_Z_ZONA_PB_Q_ID,ZonaVenditaCM462.Codice as RCLI_Z_ZONA_PB_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_DS,
   DocVenditaIntestazione.id_Azienda as RCLI_A_DS_PB_Q_ID,Azienda461.descrizione as RCLI_A_DS_PB_Q_DS,
   LK_QUARTER573.ID_YEAR as YEAR_ID,LK_YEAR574.DSS_YEAR as YEAR_DS,
   LK_MONTH572.ID_QUARTER as QUARTER_ID,LK_QUARTER573.DSS_QUARTER as QUARTER_DS,
   LK_DATE.ID_MONTH as MONTH_ID,LK_MONTH572.DSL_MONTH as MONTH_DS,
    NVL(SUM((   DocVenditaDettaglio.PrzMedioPond  *  DocVenditaDettaglio.Quantita   )),0)  AS RCLICOSTORATOTALE_2023_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda461,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.BasketMLIAnnuo BasketMLIAnnuo394,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodMarcaRicambi CodMarcaRicambi398,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodTipoRicambio CodTipoRicambio399,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH572,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER573,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR574,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.ZonaVenditaCM ZonaVenditaCM462
 WHERE
   (      BasketMLIAnnuo394.CodiceMercato = 'IT'   AND    CodMarcaRicambi398.Codice = 'FO'  AND    DocVenditaIntestazione.FlagAnnullata = 'A'  AND DocVenditaDettaglio.CancellatStampa = 'S' )
   AND   (    Azienda461.Id_CasaMadre = 1 AND Azienda461.CodMercato = 'IT'  AND Azienda461.IsDealer = 1 )
   AND   (    CodTipoRicambio399.Codice IN ( '001' , '002' , '003' , '009' , '010' , '027' , '029' , '032' , '033' , '034' , '036' , '041' , '044' , '045' , '046' , '049' , '050' , '052' , '054' , '057' , '060' , '062' , '067' , '068' , '069' , '070' , '073' , '081' , '083' , '084' , '085' , '087' , '091' , '093' , '095' , '096' , '098' , '099' , '100' , '102' , '103' , '105' , '109' , '110' , '111' , '112' , '114' , '116' , '117' , '118' , '119' , '120' , '122' , '124' , '127' , '129' , '131' , '132' , '138' , '139' , '141' , '143' , '144' , '146' , '148' , '149' , '157' , '158' , '164' , '165' , '166' , '171' , '172' , '175' , '176' , '177' , '178' , '183' , '185' , '186' , '187' , '188' , '189' , '191' , '192' , '193' , '195' , '197' , '198' , '204' , '219' , '223' , '229' , '254' , '285' , '288' , '322' , '329' , '385' , '408' , '415' , '426' , '427' , '434' , '435' , '436' , '456' , '470' , '471' , '472' , '474' , '480' , '501' , '502' , '506' , '507' , '508' , '512' , '513' , '517' , '522' , '524' , '526' , '528' , '529' , '530' , '537' , '539' , '543' , '548' , '550' , '552' , '553' , '555' , '558' , '560' , '567' , '592' , '598' , '613' , '614' , '616' , '621' , '624' , '628' , '631' , '632' , '635' , '642' , '644' , '650' , '658' , '662' , '668' , '672' , '673' , '684' , '685' , '701' , '702' , '703' , '704' , '706' , '707' , '708' , '709' , '710' , '711' , '712' , '730' , '751' , '753' , '754' , '755' , '758' , '761' , '763' )  OR ( Azienda461.CodDealerCM ||  CodTipoRicambio399.Codice ) IN ( '20100612'  , '48500612' )  )
   AND   (    DocVenditaDettaglio.id_RapportoClienteCM IN ( 2 , 3 ) )
   AND   (    DocVenditaIntestazione.id_CodCatAteco NOT IN ( 1071 , 525 , 722 , 1081 )  )
   AND   (    DocVenditaIntestazione.id_CodSedeDealer NOT IN ( 166837 )  )
   AND   (   ( DocVenditaIntestazione.VAT || DocVenditaDettaglio.id_RapportoClienteCM ) NOT IN ( 'IT027949302772' , 'IT027949302773' , 'IT033357602314' , 'IT019249610044' , 'IT049111904884' , 'IT011555103975' )   OR DocVenditaIntestazione.VAT is null   )
   AND   (   Azienda461.Attiva = 1  )
   AND   (   LK_DATE.ID_MONTH >= 201901  )
   AND   Azienda461.id=DocVenditaIntestazione.id_Azienda
   AND   BasketMLIAnnuo394.CodiceMLI=CodTipoRicambio399.Codice
   AND   CodMarcaRicambi398.id=DocVenditaDettaglio.id_CodMarcaRicambi
   AND   CodMarcaRicambi398.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   CodTipoRicambio399.id=DocVenditaDettaglio.Id_CodTipoRicambio
   AND   CodTipoRicambio399.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_MONTH572.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER573.ID_QUARTER=LK_MONTH572.ID_QUARTER
   AND   LK_YEAR574.ID_YEAR=LK_QUARTER573.ID_YEAR
   AND   ZonaVenditaCM462.id=Azienda461.id_ZonaVenditaCM
GROUP BY
   ZonaVenditaCM462.id_AreaVenditaCM,
   ZonaVenditaCM462.Descrizione,
   Azienda461.id_ZonaVenditaCM,
   Azienda461.CodDealerCM,
   Azienda461.id,
   Azienda461.descrizione,
   ZonaVenditaCM462.Codice,
   DocVenditaIntestazione.id_Azienda,
   LK_QUARTER573.ID_YEAR,
   LK_YEAR574.DSS_YEAR,
   LK_MONTH572.ID_QUARTER,
   LK_QUARTER573.DSS_QUARTER,
   LK_DATE.ID_MONTH,
   LK_MONTH572.DSL_MONTH
;




--\* Creazione tabella per il calcolo delle metriche:[rCliRicavoVE_tot_2023] */
CREATE TABLE decisyon_cache.DX170531268534563411@<AUTOMOTIVE_BI_DATA/> AS SELECT
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_ID,Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_DS,
   Azienda461.id as RCLI_A_DSAZIENDA_Q_ID,Azienda461.descrizione as RCLI_A_DSAZIENDA_Q_DS,
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_PB_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_PB_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_Z_ZONA_PB_Q_ID,ZonaVenditaCM462.Codice as RCLI_Z_ZONA_PB_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_DS,
   DocVenditaIntestazione.id_Azienda as RCLI_A_DS_PB_Q_ID,Azienda461.descrizione as RCLI_A_DS_PB_Q_DS,
   LK_QUARTER573.ID_YEAR as YEAR_ID,LK_YEAR574.DSS_YEAR as YEAR_DS,
   LK_MONTH572.ID_QUARTER as QUARTER_ID,LK_QUARTER573.DSS_QUARTER as QUARTER_DS,
   LK_DATE.ID_MONTH as MONTH_ID,LK_MONTH572.DSL_MONTH as MONTH_DS,
    NVL(SUM(DocVenditaDettaglio.NettoRiga),0)  AS RCLIRICAVOVE_TOT_2023_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda461,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.BasketMLIAnnuo BasketMLIAnnuo394,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodMarcaRicambi CodMarcaRicambi398,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodTipoRicambio CodTipoRicambio399,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH572,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER573,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR574,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.ZonaVenditaCM ZonaVenditaCM462
 WHERE
   (      BasketMLIAnnuo394.CodiceMercato = 'IT'   AND    CodMarcaRicambi398.Codice = 'FO'  AND    DocVenditaIntestazione.FlagAnnullata = 'A'  AND DocVenditaDettaglio.CancellatStampa = 'S' )
   AND   (    Azienda461.Id_CasaMadre = 1 AND Azienda461.CodMercato = 'IT'  AND Azienda461.IsDealer = 1 )
   AND   (    CodTipoRicambio399.Codice IN ( '001' , '002' , '003' , '009' , '010' , '027' , '029' , '032' , '033' , '034' , '036' , '041' , '044' , '045' , '046' , '049' , '050' , '052' , '054' , '057' , '060' , '062' , '067' , '068' , '069' , '070' , '073' , '081' , '083' , '084' , '085' , '087' , '091' , '093' , '095' , '096' , '098' , '099' , '100' , '102' , '103' , '105' , '109' , '110' , '111' , '112' , '114' , '116' , '117' , '118' , '119' , '120' , '122' , '124' , '127' , '129' , '131' , '132' , '138' , '139' , '141' , '143' , '144' , '146' , '148' , '149' , '157' , '158' , '164' , '165' , '166' , '171' , '172' , '175' , '176' , '177' , '178' , '183' , '185' , '186' , '187' , '188' , '189' , '191' , '192' , '193' , '195' , '197' , '198' , '204' , '219' , '223' , '229' , '254' , '285' , '288' , '322' , '329' , '385' , '408' , '415' , '426' , '427' , '434' , '435' , '436' , '456' , '470' , '471' , '472' , '474' , '480' , '501' , '502' , '506' , '507' , '508' , '512' , '513' , '517' , '522' , '524' , '526' , '528' , '529' , '530' , '537' , '539' , '543' , '548' , '550' , '552' , '553' , '555' , '558' , '560' , '567' , '592' , '598' , '613' , '614' , '616' , '621' , '624' , '628' , '631' , '632' , '635' , '642' , '644' , '650' , '658' , '662' , '668' , '672' , '673' , '684' , '685' , '701' , '702' , '703' , '704' , '706' , '707' , '708' , '709' , '710' , '711' , '712' , '730' , '751' , '753' , '754' , '755' , '758' , '761' , '763' )  OR ( Azienda461.CodDealerCM ||  CodTipoRicambio399.Codice ) IN ( '20100612'  , '48500612' )  )
   AND   (    DocVenditaDettaglio.id_RapportoClienteCM IN ( 4 , 5 )  )
   AND   (    DocVenditaIntestazione.id_CodCatAteco NOT IN ( 1071 , 525 , 722 , 1081 )  )
   AND   (    DocVenditaIntestazione.id_CodCatAteco NOT IN ( 1071 , 525 , 722 , 1081 , 6 , 22 , 28 , 375 , 577 , 648 , 766 , 1058 , 1061 )  )
   AND   (    DocVenditaIntestazione.id_CodSedeDealer NOT IN ( 166837 )  )
   AND   (   ( DocVenditaIntestazione.VAT || DocVenditaDettaglio.id_RapportoClienteCM ) NOT IN ( 'IT027949302772' , 'IT027949302773' , 'IT033357602314' , 'IT019249610044' , 'IT049111904884' , 'IT011555103975' )   OR DocVenditaIntestazione.VAT is null   )
   AND   (   Azienda461.Attiva = 1  )
   AND   (   DocVenditaIntestazione.VAT  NOT IN ( 'IT03335760231' )    OR   DocVenditaIntestazione.VAT is null  )
   AND   (   LK_DATE.ID_MONTH >= 201901  )
   AND   Azienda461.id=DocVenditaIntestazione.id_Azienda
   AND   BasketMLIAnnuo394.CodiceMLI=CodTipoRicambio399.Codice
   AND   CodMarcaRicambi398.id=DocVenditaDettaglio.id_CodMarcaRicambi
   AND   CodMarcaRicambi398.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   CodTipoRicambio399.id=DocVenditaDettaglio.Id_CodTipoRicambio
   AND   CodTipoRicambio399.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_MONTH572.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER573.ID_QUARTER=LK_MONTH572.ID_QUARTER
   AND   LK_YEAR574.ID_YEAR=LK_QUARTER573.ID_YEAR
   AND   ZonaVenditaCM462.id=Azienda461.id_ZonaVenditaCM
GROUP BY
   ZonaVenditaCM462.id_AreaVenditaCM,
   ZonaVenditaCM462.Descrizione,
   Azienda461.id_ZonaVenditaCM,
   Azienda461.CodDealerCM,
   Azienda461.id,
   Azienda461.descrizione,
   ZonaVenditaCM462.Codice,
   DocVenditaIntestazione.id_Azienda,
   LK_QUARTER573.ID_YEAR,
   LK_YEAR574.DSS_YEAR,
   LK_MONTH572.ID_QUARTER,
   LK_QUARTER573.DSS_QUARTER,
   LK_DATE.ID_MONTH,
   LK_MONTH572.DSL_MONTH
;




--\* Creazione tabella per il calcolo delle metriche:[rCliCostoAltriFP5_2023] */
CREATE TABLE decisyon_cache.DX170531268539125212@<AUTOMOTIVE_BI_DATA/> AS SELECT
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_ID,Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_DS,
   Azienda461.id as RCLI_A_DSAZIENDA_Q_ID,Azienda461.descrizione as RCLI_A_DSAZIENDA_Q_DS,
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_PB_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_PB_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_Z_ZONA_PB_Q_ID,ZonaVenditaCM462.Codice as RCLI_Z_ZONA_PB_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_DS,
   DocVenditaIntestazione.id_Azienda as RCLI_A_DS_PB_Q_ID,Azienda461.descrizione as RCLI_A_DS_PB_Q_DS,
   LK_QUARTER573.ID_YEAR as YEAR_ID,LK_YEAR574.DSS_YEAR as YEAR_DS,
   LK_MONTH572.ID_QUARTER as QUARTER_ID,LK_QUARTER573.DSS_QUARTER as QUARTER_DS,
   LK_DATE.ID_MONTH as MONTH_ID,LK_MONTH572.DSL_MONTH as MONTH_DS,
    NVL(SUM((   DocVenditaDettaglio.PrzMedioPond  *  DocVenditaDettaglio.Quantita   )),0)  AS RCLICOSTOALTRIFP5_2023_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda461,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.BasketMLIAnnuo BasketMLIAnnuo394,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodMarcaRicambi CodMarcaRicambi398,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodTipoRicambio CodTipoRicambio399,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH572,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER573,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR574,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.ZonaVenditaCM ZonaVenditaCM462
 WHERE
   (      BasketMLIAnnuo394.CodiceMercato = 'IT'   AND    CodMarcaRicambi398.Codice = 'FO'  AND    DocVenditaIntestazione.FlagAnnullata = 'A'  AND DocVenditaDettaglio.CancellatStampa = 'S' )
   AND   (      DocVenditaIntestazione.VAT NOT IN ( 'IT00894451004' , 'IT02196130641' , 'IT03859710109' , 'IT01163670936' , 'IT06339210723' , 'IT02687710984' , 'IT01911070785' , 'IT00123460875' , 'IT01123130450' , 'IT01442070353' , 'IT04124900269' , 'IT02230670800' , 'IT05827990960' , 'IT02115030971' , 'IT00112410337' , 'IT00474870375' , 'IT00728290362' , 'IT04161820966' , 'IT01216270114' , 'IT00877251009' , 'IT01141640522' , 'IT00411480221' , 'IT10904880159' , 'IT02230140218' , 'IT02431970215' , 'IT00497670026' , 'IT10071571003' , 'IT00222080046' , 'IT00755710159' , 'IT01110220660' , 'IT02739310726' , 'IT03238950178' , 'IT13195780153' , 'IT06764011216' , 'IT01097790909' , 'IT07853751217' , 'IT02343080541' , 'IT08108671218' , 'IT04216480659' , 'IT00355290834' , 'IT02000910618' , 'IT00191440262' , 'IT02202650244' , 'IT02794930277' , 'IT01299640027' , 'IT04409710011' , 'IT01338500158' , 'IT01684210014' , 'IT00097480446' , 'IT02574360232' , 'IT02151110414' , 'IT05118971000' , 'IT00430770123' , 'IT01008380071' , 'IT03455130728' , 'IT00234350692' , 'IT02260880923' , 'IT02156370484' , 'IT00582100673' , 'IT10718960155' , 'IT00243940525' , 'IT02766620211' , 'IT01155510397' , 'IT03240950828' , 'IT01479020511' , 'IT02124430782' , 'IT01016420885' , 'IT01402610495' , 'IT02369580739' , 'IT01132990290' , 'IT03359300757' , 'IT02184740344' , 'IT06929101001' , 'IT02034130928' , 'IT00380720094' , 'IT01616090690' , 'IT02101470595' , 'IT00557040805' , 'IT03301780403' , 'IT01944700846' , 'IT10385040158' , 'IT01330570464' , 'IT04700670484' , 'IT01464390523' , 'IT00458020773' , 'IT02294240045' , 'IT00586680142' , 'IT10804310158' ) or     DocVenditaIntestazione.VAT is null  )
   AND   (    Azienda461.Id_CasaMadre = 1 AND Azienda461.CodMercato = 'IT'  AND Azienda461.IsDealer = 1 )
   AND   (    CodTipoRicambio399.Codice IN ( '001' , '002' , '003' , '009' , '010' , '027' , '029' , '032' , '033' , '034' , '036' , '041' , '044' , '045' , '046' , '049' , '050' , '052' , '054' , '057' , '060' , '062' , '067' , '068' , '069' , '070' , '073' , '081' , '083' , '084' , '085' , '087' , '091' , '093' , '095' , '096' , '098' , '099' , '100' , '102' , '103' , '105' , '109' , '110' , '111' , '112' , '114' , '116' , '117' , '118' , '119' , '120' , '122' , '124' , '127' , '129' , '131' , '132' , '138' , '139' , '141' , '143' , '144' , '146' , '148' , '149' , '157' , '158' , '164' , '165' , '166' , '171' , '172' , '175' , '176' , '177' , '178' , '183' , '185' , '186' , '187' , '188' , '189' , '191' , '192' , '193' , '195' , '197' , '198' , '204' , '219' , '223' , '229' , '254' , '285' , '288' , '322' , '329' , '385' , '408' , '415' , '426' , '427' , '434' , '435' , '436' , '456' , '470' , '471' , '472' , '474' , '480' , '501' , '502' , '506' , '507' , '508' , '512' , '513' , '517' , '522' , '524' , '526' , '528' , '529' , '530' , '537' , '539' , '543' , '548' , '550' , '552' , '553' , '555' , '558' , '560' , '567' , '592' , '598' , '613' , '614' , '616' , '621' , '624' , '628' , '631' , '632' , '635' , '642' , '644' , '650' , '658' , '662' , '668' , '672' , '673' , '684' , '685' , '701' , '702' , '703' , '704' , '706' , '707' , '708' , '709' , '710' , '711' , '712' , '730' , '751' , '753' , '754' , '755' , '758' , '761' , '763' )  OR ( Azienda461.CodDealerCM ||  CodTipoRicambio399.Codice ) IN ( '20100612'  , '48500612' )  )
   AND   (    DocVenditaDettaglio.id_RapportoClienteCM = 5  )
   AND   (    DocVenditaIntestazione.id_CodCatAteco NOT IN ( 1071 , 525 , 722 , 1081 )  )
   AND   (    DocVenditaIntestazione.id_CodSedeDealer NOT IN ( 166837 )  )
   AND   (   ( DocVenditaIntestazione.VAT || DocVenditaDettaglio.id_RapportoClienteCM ) NOT IN ( 'IT027949302772' , 'IT027949302773' , 'IT033357602314' , 'IT019249610044' , 'IT049111904884' , 'IT011555103975' )   OR DocVenditaIntestazione.VAT is null   )
   AND   (   Azienda461.Attiva = 1  )
   AND   (   LK_DATE.ID_MONTH >= 201901  )
   AND   Azienda461.id=DocVenditaIntestazione.id_Azienda
   AND   BasketMLIAnnuo394.CodiceMLI=CodTipoRicambio399.Codice
   AND   CodMarcaRicambi398.id=DocVenditaDettaglio.id_CodMarcaRicambi
   AND   CodMarcaRicambi398.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   CodTipoRicambio399.id=DocVenditaDettaglio.Id_CodTipoRicambio
   AND   CodTipoRicambio399.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_MONTH572.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER573.ID_QUARTER=LK_MONTH572.ID_QUARTER
   AND   LK_YEAR574.ID_YEAR=LK_QUARTER573.ID_YEAR
   AND   ZonaVenditaCM462.id=Azienda461.id_ZonaVenditaCM
GROUP BY
   ZonaVenditaCM462.id_AreaVenditaCM,
   ZonaVenditaCM462.Descrizione,
   Azienda461.id_ZonaVenditaCM,
   Azienda461.CodDealerCM,
   Azienda461.id,
   Azienda461.descrizione,
   ZonaVenditaCM462.Codice,
   DocVenditaIntestazione.id_Azienda,
   LK_QUARTER573.ID_YEAR,
   LK_YEAR574.DSS_YEAR,
   LK_MONTH572.ID_QUARTER,
   LK_QUARTER573.DSS_QUARTER,
   LK_DATE.ID_MONTH,
   LK_MONTH572.DSL_MONTH
;




--\* Creazione tabella per il calcolo delle metriche:[rCliCostoRappNPIVA_2023] */
CREATE TABLE decisyon_cache.DX170531268541045113@<AUTOMOTIVE_BI_DATA/> AS SELECT
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_ID,Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_DS,
   Azienda461.id as RCLI_A_DSAZIENDA_Q_ID,Azienda461.descrizione as RCLI_A_DSAZIENDA_Q_DS,
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_PB_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_PB_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_Z_ZONA_PB_Q_ID,ZonaVenditaCM462.Codice as RCLI_Z_ZONA_PB_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_DS,
   DocVenditaIntestazione.id_Azienda as RCLI_A_DS_PB_Q_ID,Azienda461.descrizione as RCLI_A_DS_PB_Q_DS,
   LK_QUARTER573.ID_YEAR as YEAR_ID,LK_YEAR574.DSS_YEAR as YEAR_DS,
   LK_MONTH572.ID_QUARTER as QUARTER_ID,LK_QUARTER573.DSS_QUARTER as QUARTER_DS,
   LK_DATE.ID_MONTH as MONTH_ID,LK_MONTH572.DSL_MONTH as MONTH_DS,
    NVL(SUM((   DocVenditaDettaglio.PrzMedioPond  *  DocVenditaDettaglio.Quantita   )),0)  AS RCLICOSTORAPPNPIVA_2023_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda461,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.BasketMLIAnnuo BasketMLIAnnuo394,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodMarcaRicambi CodMarcaRicambi398,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodTipoRicambio CodTipoRicambio399,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH572,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER573,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR574,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.ZonaVenditaCM ZonaVenditaCM462
 WHERE
   (      BasketMLIAnnuo394.CodiceMercato = 'IT'   AND    CodMarcaRicambi398.Codice = 'FO'  AND    DocVenditaIntestazione.FlagAnnullata = 'A'  AND DocVenditaDettaglio.CancellatStampa = 'S' )
   AND   (    Azienda461.Id_CasaMadre = 1 AND Azienda461.CodMercato = 'IT'  AND Azienda461.IsDealer = 1 )
   AND   (    CodTipoRicambio399.Codice IN ( '001' , '002' , '003' , '009' , '010' , '027' , '029' , '032' , '033' , '034' , '036' , '041' , '044' , '045' , '046' , '049' , '050' , '052' , '054' , '057' , '060' , '062' , '067' , '068' , '069' , '070' , '073' , '081' , '083' , '084' , '085' , '087' , '091' , '093' , '095' , '096' , '098' , '099' , '100' , '102' , '103' , '105' , '109' , '110' , '111' , '112' , '114' , '116' , '117' , '118' , '119' , '120' , '122' , '124' , '127' , '129' , '131' , '132' , '138' , '139' , '141' , '143' , '144' , '146' , '148' , '149' , '157' , '158' , '164' , '165' , '166' , '171' , '172' , '175' , '176' , '177' , '178' , '183' , '185' , '186' , '187' , '188' , '189' , '191' , '192' , '193' , '195' , '197' , '198' , '204' , '219' , '223' , '229' , '254' , '285' , '288' , '322' , '329' , '385' , '408' , '415' , '426' , '427' , '434' , '435' , '436' , '456' , '470' , '471' , '472' , '474' , '480' , '501' , '502' , '506' , '507' , '508' , '512' , '513' , '517' , '522' , '524' , '526' , '528' , '529' , '530' , '537' , '539' , '543' , '548' , '550' , '552' , '553' , '555' , '558' , '560' , '567' , '592' , '598' , '613' , '614' , '616' , '621' , '624' , '628' , '631' , '632' , '635' , '642' , '644' , '650' , '658' , '662' , '668' , '672' , '673' , '684' , '685' , '701' , '702' , '703' , '704' , '706' , '707' , '708' , '709' , '710' , '711' , '712' , '730' , '751' , '753' , '754' , '755' , '758' , '761' , '763' )  OR ( Azienda461.CodDealerCM ||  CodTipoRicambio399.Codice ) IN ( '20100612'  , '48500612' )  )
   AND   (    DocVenditaDettaglio.id_RapportoClienteCM = 4 )
   AND   (    DocVenditaIntestazione.id_CodCatAteco NOT IN ( 1071 , 525 , 722 , 1081 )  )
   AND   (    DocVenditaIntestazione.id_CodCatAteco NOT IN ( 1071 , 525 , 722 , 1081 , 6 , 22 , 28 , 375 , 577 , 648 , 766 , 1058 , 1061 )  )
   AND   (    DocVenditaIntestazione.id_CodSedeDealer NOT IN ( 166837 )  )
   AND   (   ( DocVenditaIntestazione.VAT || DocVenditaDettaglio.id_RapportoClienteCM ) NOT IN ( 'IT027949302772' , 'IT027949302773' , 'IT033357602314' , 'IT019249610044' , 'IT049111904884' , 'IT011555103975' )   OR DocVenditaIntestazione.VAT is null   )
   AND   (   Azienda461.Attiva = 1  )
   AND   (   DocVenditaIntestazione.VAT  NOT IN ( 'IT03335760231' )    OR   DocVenditaIntestazione.VAT is null  )
   AND   (   LK_DATE.ID_MONTH >= 201901  )
   AND   Azienda461.id=DocVenditaIntestazione.id_Azienda
   AND   BasketMLIAnnuo394.CodiceMLI=CodTipoRicambio399.Codice
   AND   CodMarcaRicambi398.id=DocVenditaDettaglio.id_CodMarcaRicambi
   AND   CodMarcaRicambi398.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   CodTipoRicambio399.id=DocVenditaDettaglio.Id_CodTipoRicambio
   AND   CodTipoRicambio399.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_MONTH572.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER573.ID_QUARTER=LK_MONTH572.ID_QUARTER
   AND   LK_YEAR574.ID_YEAR=LK_QUARTER573.ID_YEAR
   AND   ZonaVenditaCM462.id=Azienda461.id_ZonaVenditaCM
GROUP BY
   ZonaVenditaCM462.id_AreaVenditaCM,
   ZonaVenditaCM462.Descrizione,
   Azienda461.id_ZonaVenditaCM,
   Azienda461.CodDealerCM,
   Azienda461.id,
   Azienda461.descrizione,
   ZonaVenditaCM462.Codice,
   DocVenditaIntestazione.id_Azienda,
   LK_QUARTER573.ID_YEAR,
   LK_YEAR574.DSS_YEAR,
   LK_MONTH572.ID_QUARTER,
   LK_QUARTER573.DSS_QUARTER,
   LK_DATE.ID_MONTH,
   LK_MONTH572.DSL_MONTH
;




--\* Creazione tabella per il calcolo delle metriche:[rCliRicRAIncr_3_2023] */
CREATE TABLE decisyon_cache.DX170531268542436714@<AUTOMOTIVE_BI_DATA/> AS SELECT
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_ID,Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_DS,
   Azienda461.id as RCLI_A_DSAZIENDA_Q_ID,Azienda461.descrizione as RCLI_A_DSAZIENDA_Q_DS,
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_PB_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_PB_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_Z_ZONA_PB_Q_ID,ZonaVenditaCM462.Codice as RCLI_Z_ZONA_PB_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_DS,
   DocVenditaIntestazione.id_Azienda as RCLI_A_DS_PB_Q_ID,Azienda461.descrizione as RCLI_A_DS_PB_Q_DS,
   LK_QUARTER573.ID_YEAR as YEAR_ID,LK_YEAR574.DSS_YEAR as YEAR_DS,
   LK_MONTH572.ID_QUARTER as QUARTER_ID,LK_QUARTER573.DSS_QUARTER as QUARTER_DS,
   LK_DATE.ID_MONTH as MONTH_ID,LK_MONTH572.DSL_MONTH as MONTH_DS,
    NVL(SUM(DocVenditaDettaglio.NettoRiga),0)  AS RCLIRICRAINCR_3_2023_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda461,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.BasketMLIAnnuo BasketMLIAnnuo394,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodMarcaRicambi CodMarcaRicambi398,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodTipoRicambio CodTipoRicambio399,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH572,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER573,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR574,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.ZonaVenditaCM ZonaVenditaCM462
 WHERE
   (      BasketMLIAnnuo394.CodiceMercato = 'IT'   AND    CodMarcaRicambi398.Codice = 'FO'  AND    DocVenditaIntestazione.FlagAnnullata = 'A'  AND DocVenditaDettaglio.CancellatStampa = 'S' )
   AND   (    Azienda461.Id_CasaMadre = 1 AND Azienda461.CodMercato = 'IT'  AND Azienda461.IsDealer = 1 )
   AND   (    CodTipoRicambio399.Codice IN ( '001' , '002' , '003' , '009' , '010' , '027' , '029' , '032' , '033' , '034' , '036' , '041' , '044' , '045' , '046' , '049' , '050' , '052' , '054' , '057' , '060' , '062' , '067' , '068' , '069' , '070' , '073' , '081' , '083' , '084' , '085' , '087' , '091' , '093' , '095' , '096' , '098' , '099' , '100' , '102' , '103' , '105' , '109' , '110' , '111' , '112' , '114' , '116' , '117' , '118' , '119' , '120' , '122' , '124' , '127' , '129' , '131' , '132' , '138' , '139' , '141' , '143' , '144' , '146' , '148' , '149' , '157' , '158' , '164' , '165' , '166' , '171' , '172' , '175' , '176' , '177' , '178' , '183' , '185' , '186' , '187' , '188' , '189' , '191' , '192' , '193' , '195' , '197' , '198' , '204' , '219' , '223' , '229' , '254' , '285' , '288' , '322' , '329' , '385' , '408' , '415' , '426' , '427' , '434' , '435' , '436' , '456' , '470' , '471' , '472' , '474' , '480' , '501' , '502' , '506' , '507' , '508' , '512' , '513' , '517' , '522' , '524' , '526' , '528' , '529' , '530' , '537' , '539' , '543' , '548' , '550' , '552' , '553' , '555' , '558' , '560' , '567' , '592' , '598' , '613' , '614' , '616' , '621' , '624' , '628' , '631' , '632' , '635' , '642' , '644' , '650' , '658' , '662' , '668' , '672' , '673' , '684' , '685' , '701' , '702' , '703' , '704' , '706' , '707' , '708' , '709' , '710' , '711' , '712' , '730' , '751' , '753' , '754' , '755' , '758' , '761' , '763' )  OR ( Azienda461.CodDealerCM ||  CodTipoRicambio399.Codice ) IN ( '20100612'  , '48500612' )  )
   AND   (    DocVenditaDettaglio.id_RapportoClienteCM = 3 )
   AND   (    DocVenditaIntestazione.id_CodCatAteco NOT IN ( 1071 , 525 , 722 , 1081 )  )
   AND   (    DocVenditaIntestazione.id_CodSedeDealer NOT IN ( 166837 )  )
   AND   (   ( DocVenditaIntestazione.VAT || DocVenditaDettaglio.id_RapportoClienteCM ) NOT IN ( 'IT027949302772' , 'IT027949302773' , 'IT033357602314' , 'IT019249610044' , 'IT049111904884' , 'IT011555103975' )   OR DocVenditaIntestazione.VAT is null   )
   AND   (   Azienda461.Attiva = 1  )
   AND   (   LK_DATE.ID_MONTH >= 201901  )
   AND   Azienda461.id=DocVenditaIntestazione.id_Azienda
   AND   BasketMLIAnnuo394.CodiceMLI=CodTipoRicambio399.Codice
   AND   CodMarcaRicambi398.id=DocVenditaDettaglio.id_CodMarcaRicambi
   AND   CodMarcaRicambi398.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   CodTipoRicambio399.id=DocVenditaDettaglio.Id_CodTipoRicambio
   AND   CodTipoRicambio399.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_MONTH572.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER573.ID_QUARTER=LK_MONTH572.ID_QUARTER
   AND   LK_YEAR574.ID_YEAR=LK_QUARTER573.ID_YEAR
   AND   ZonaVenditaCM462.id=Azienda461.id_ZonaVenditaCM
GROUP BY
   ZonaVenditaCM462.id_AreaVenditaCM,
   ZonaVenditaCM462.Descrizione,
   Azienda461.id_ZonaVenditaCM,
   Azienda461.CodDealerCM,
   Azienda461.id,
   Azienda461.descrizione,
   ZonaVenditaCM462.Codice,
   DocVenditaIntestazione.id_Azienda,
   LK_QUARTER573.ID_YEAR,
   LK_YEAR574.DSS_YEAR,
   LK_MONTH572.ID_QUARTER,
   LK_QUARTER573.DSS_QUARTER,
   LK_DATE.ID_MONTH,
   LK_MONTH572.DSL_MONTH
;




--\* Creazione tabella per il calcolo delle metriche:[rCliCostoRAIncroci_2023] */
CREATE TABLE decisyon_cache.DX170531268545823715@<AUTOMOTIVE_BI_DATA/> AS SELECT
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_ID,Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_DS,
   Azienda461.id as RCLI_A_DSAZIENDA_Q_ID,Azienda461.descrizione as RCLI_A_DSAZIENDA_Q_DS,
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_PB_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_PB_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_Z_ZONA_PB_Q_ID,ZonaVenditaCM462.Codice as RCLI_Z_ZONA_PB_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_DS,
   DocVenditaIntestazione.id_Azienda as RCLI_A_DS_PB_Q_ID,Azienda461.descrizione as RCLI_A_DS_PB_Q_DS,
   LK_QUARTER573.ID_YEAR as YEAR_ID,LK_YEAR574.DSS_YEAR as YEAR_DS,
   LK_MONTH572.ID_QUARTER as QUARTER_ID,LK_QUARTER573.DSS_QUARTER as QUARTER_DS,
   LK_DATE.ID_MONTH as MONTH_ID,LK_MONTH572.DSL_MONTH as MONTH_DS,
    NVL(SUM((   DocVenditaDettaglio.PrzMedioPond  *  DocVenditaDettaglio.Quantita   )),0)  AS RCLICOSTORAINCROCI_2023_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda461,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.BasketMLIAnnuo BasketMLIAnnuo394,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodMarcaRicambi CodMarcaRicambi398,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodTipoRicambio CodTipoRicambio399,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH572,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER573,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR574,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.ZonaVenditaCM ZonaVenditaCM462
 WHERE
   (      BasketMLIAnnuo394.CodiceMercato = 'IT'   AND    CodMarcaRicambi398.Codice = 'FO'  AND    DocVenditaIntestazione.FlagAnnullata = 'A'  AND DocVenditaDettaglio.CancellatStampa = 'S' )
   AND   (    Azienda461.Id_CasaMadre = 1 AND Azienda461.CodMercato = 'IT'  AND Azienda461.IsDealer = 1 )
   AND   (    CodTipoRicambio399.Codice IN ( '001' , '002' , '003' , '009' , '010' , '027' , '029' , '032' , '033' , '034' , '036' , '041' , '044' , '045' , '046' , '049' , '050' , '052' , '054' , '057' , '060' , '062' , '067' , '068' , '069' , '070' , '073' , '081' , '083' , '084' , '085' , '087' , '091' , '093' , '095' , '096' , '098' , '099' , '100' , '102' , '103' , '105' , '109' , '110' , '111' , '112' , '114' , '116' , '117' , '118' , '119' , '120' , '122' , '124' , '127' , '129' , '131' , '132' , '138' , '139' , '141' , '143' , '144' , '146' , '148' , '149' , '157' , '158' , '164' , '165' , '166' , '171' , '172' , '175' , '176' , '177' , '178' , '183' , '185' , '186' , '187' , '188' , '189' , '191' , '192' , '193' , '195' , '197' , '198' , '204' , '219' , '223' , '229' , '254' , '285' , '288' , '322' , '329' , '385' , '408' , '415' , '426' , '427' , '434' , '435' , '436' , '456' , '470' , '471' , '472' , '474' , '480' , '501' , '502' , '506' , '507' , '508' , '512' , '513' , '517' , '522' , '524' , '526' , '528' , '529' , '530' , '537' , '539' , '543' , '548' , '550' , '552' , '553' , '555' , '558' , '560' , '567' , '592' , '598' , '613' , '614' , '616' , '621' , '624' , '628' , '631' , '632' , '635' , '642' , '644' , '650' , '658' , '662' , '668' , '672' , '673' , '684' , '685' , '701' , '702' , '703' , '704' , '706' , '707' , '708' , '709' , '710' , '711' , '712' , '730' , '751' , '753' , '754' , '755' , '758' , '761' , '763' )  OR ( Azienda461.CodDealerCM ||  CodTipoRicambio399.Codice ) IN ( '20100612'  , '48500612' )  )
   AND   (    DocVenditaDettaglio.id_RapportoClienteCM = 3 )
   AND   (    DocVenditaIntestazione.id_CodCatAteco NOT IN ( 1071 , 525 , 722 , 1081 )  )
   AND   (    DocVenditaIntestazione.id_CodSedeDealer NOT IN ( 166837 )  )
   AND   (   ( DocVenditaIntestazione.VAT || DocVenditaDettaglio.id_RapportoClienteCM ) NOT IN ( 'IT027949302772' , 'IT027949302773' , 'IT033357602314' , 'IT019249610044' , 'IT049111904884' , 'IT011555103975' )   OR DocVenditaIntestazione.VAT is null   )
   AND   (   Azienda461.Attiva = 1  )
   AND   (   LK_DATE.ID_MONTH >= 201901  )
   AND   Azienda461.id=DocVenditaIntestazione.id_Azienda
   AND   BasketMLIAnnuo394.CodiceMLI=CodTipoRicambio399.Codice
   AND   CodMarcaRicambi398.id=DocVenditaDettaglio.id_CodMarcaRicambi
   AND   CodMarcaRicambi398.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   CodTipoRicambio399.id=DocVenditaDettaglio.Id_CodTipoRicambio
   AND   CodTipoRicambio399.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_MONTH572.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER573.ID_QUARTER=LK_MONTH572.ID_QUARTER
   AND   LK_YEAR574.ID_YEAR=LK_QUARTER573.ID_YEAR
   AND   ZonaVenditaCM462.id=Azienda461.id_ZonaVenditaCM
GROUP BY
   ZonaVenditaCM462.id_AreaVenditaCM,
   ZonaVenditaCM462.Descrizione,
   Azienda461.id_ZonaVenditaCM,
   Azienda461.CodDealerCM,
   Azienda461.id,
   Azienda461.descrizione,
   ZonaVenditaCM462.Codice,
   DocVenditaIntestazione.id_Azienda,
   LK_QUARTER573.ID_YEAR,
   LK_YEAR574.DSS_YEAR,
   LK_MONTH572.ID_QUARTER,
   LK_QUARTER573.DSS_QUARTER,
   LK_DATE.ID_MONTH,
   LK_MONTH572.DSL_MONTH
;




--\* Creazione tabella per il calcolo delle metriche:[rCliRicavoRADir_2_2023] */
CREATE TABLE decisyon_cache.DX170531268547316216@<AUTOMOTIVE_BI_DATA/> AS SELECT
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_ID,Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_DS,
   Azienda461.id as RCLI_A_DSAZIENDA_Q_ID,Azienda461.descrizione as RCLI_A_DSAZIENDA_Q_DS,
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_PB_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_PB_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_Z_ZONA_PB_Q_ID,ZonaVenditaCM462.Codice as RCLI_Z_ZONA_PB_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_DS,
   DocVenditaIntestazione.id_Azienda as RCLI_A_DS_PB_Q_ID,Azienda461.descrizione as RCLI_A_DS_PB_Q_DS,
   LK_QUARTER573.ID_YEAR as YEAR_ID,LK_YEAR574.DSS_YEAR as YEAR_DS,
   LK_MONTH572.ID_QUARTER as QUARTER_ID,LK_QUARTER573.DSS_QUARTER as QUARTER_DS,
   LK_DATE.ID_MONTH as MONTH_ID,LK_MONTH572.DSL_MONTH as MONTH_DS,
    NVL(SUM(DocVenditaDettaglio.NettoRiga),0)  AS RCLIRICAVORADIR_2_2023_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda461,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.BasketMLIAnnuo BasketMLIAnnuo394,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodMarcaRicambi CodMarcaRicambi398,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodTipoRicambio CodTipoRicambio399,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH572,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER573,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR574,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.ZonaVenditaCM ZonaVenditaCM462
 WHERE
   (      BasketMLIAnnuo394.CodiceMercato = 'IT'   AND    CodMarcaRicambi398.Codice = 'FO'  AND    DocVenditaIntestazione.FlagAnnullata = 'A'  AND DocVenditaDettaglio.CancellatStampa = 'S' )
   AND   (    Azienda461.Id_CasaMadre = 1 AND Azienda461.CodMercato = 'IT'  AND Azienda461.IsDealer = 1 )
   AND   (    CodTipoRicambio399.Codice IN ( '001' , '002' , '003' , '009' , '010' , '027' , '029' , '032' , '033' , '034' , '036' , '041' , '044' , '045' , '046' , '049' , '050' , '052' , '054' , '057' , '060' , '062' , '067' , '068' , '069' , '070' , '073' , '081' , '083' , '084' , '085' , '087' , '091' , '093' , '095' , '096' , '098' , '099' , '100' , '102' , '103' , '105' , '109' , '110' , '111' , '112' , '114' , '116' , '117' , '118' , '119' , '120' , '122' , '124' , '127' , '129' , '131' , '132' , '138' , '139' , '141' , '143' , '144' , '146' , '148' , '149' , '157' , '158' , '164' , '165' , '166' , '171' , '172' , '175' , '176' , '177' , '178' , '183' , '185' , '186' , '187' , '188' , '189' , '191' , '192' , '193' , '195' , '197' , '198' , '204' , '219' , '223' , '229' , '254' , '285' , '288' , '322' , '329' , '385' , '408' , '415' , '426' , '427' , '434' , '435' , '436' , '456' , '470' , '471' , '472' , '474' , '480' , '501' , '502' , '506' , '507' , '508' , '512' , '513' , '517' , '522' , '524' , '526' , '528' , '529' , '530' , '537' , '539' , '543' , '548' , '550' , '552' , '553' , '555' , '558' , '560' , '567' , '592' , '598' , '613' , '614' , '616' , '621' , '624' , '628' , '631' , '632' , '635' , '642' , '644' , '650' , '658' , '662' , '668' , '672' , '673' , '684' , '685' , '701' , '702' , '703' , '704' , '706' , '707' , '708' , '709' , '710' , '711' , '712' , '730' , '751' , '753' , '754' , '755' , '758' , '761' , '763' )  OR ( Azienda461.CodDealerCM ||  CodTipoRicambio399.Codice ) IN ( '20100612'  , '48500612' )  )
   AND   (    DocVenditaDettaglio.id_RapportoClienteCM = 2 )
   AND   (    DocVenditaIntestazione.id_CodCatAteco NOT IN ( 1071 , 525 , 722 , 1081 )  )
   AND   (    DocVenditaIntestazione.id_CodSedeDealer NOT IN ( 166837 )  )
   AND   (   ( DocVenditaIntestazione.VAT || DocVenditaDettaglio.id_RapportoClienteCM ) NOT IN ( 'IT027949302772' , 'IT027949302773' , 'IT033357602314' , 'IT019249610044' , 'IT049111904884' , 'IT011555103975' )   OR DocVenditaIntestazione.VAT is null   )
   AND   (   Azienda461.Attiva = 1  )
   AND   (   LK_DATE.ID_MONTH >= 201901  )
   AND   Azienda461.id=DocVenditaIntestazione.id_Azienda
   AND   BasketMLIAnnuo394.CodiceMLI=CodTipoRicambio399.Codice
   AND   CodMarcaRicambi398.id=DocVenditaDettaglio.id_CodMarcaRicambi
   AND   CodMarcaRicambi398.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   CodTipoRicambio399.id=DocVenditaDettaglio.Id_CodTipoRicambio
   AND   CodTipoRicambio399.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_MONTH572.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER573.ID_QUARTER=LK_MONTH572.ID_QUARTER
   AND   LK_YEAR574.ID_YEAR=LK_QUARTER573.ID_YEAR
   AND   ZonaVenditaCM462.id=Azienda461.id_ZonaVenditaCM
GROUP BY
   ZonaVenditaCM462.id_AreaVenditaCM,
   ZonaVenditaCM462.Descrizione,
   Azienda461.id_ZonaVenditaCM,
   Azienda461.CodDealerCM,
   Azienda461.id,
   Azienda461.descrizione,
   ZonaVenditaCM462.Codice,
   DocVenditaIntestazione.id_Azienda,
   LK_QUARTER573.ID_YEAR,
   LK_YEAR574.DSS_YEAR,
   LK_MONTH572.ID_QUARTER,
   LK_QUARTER573.DSS_QUARTER,
   LK_DATE.ID_MONTH,
   LK_MONTH572.DSL_MONTH
;




--\* Creazione tabella per il calcolo delle metriche:[rCliCostoRADiretta_2023] */
CREATE TABLE decisyon_cache.DX170531268549113217@<AUTOMOTIVE_BI_DATA/> AS SELECT
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_ID,Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_DS,
   Azienda461.id as RCLI_A_DSAZIENDA_Q_ID,Azienda461.descrizione as RCLI_A_DSAZIENDA_Q_DS,
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_PB_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_PB_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_Z_ZONA_PB_Q_ID,ZonaVenditaCM462.Codice as RCLI_Z_ZONA_PB_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_DS,
   DocVenditaIntestazione.id_Azienda as RCLI_A_DS_PB_Q_ID,Azienda461.descrizione as RCLI_A_DS_PB_Q_DS,
   LK_QUARTER573.ID_YEAR as YEAR_ID,LK_YEAR574.DSS_YEAR as YEAR_DS,
   LK_MONTH572.ID_QUARTER as QUARTER_ID,LK_QUARTER573.DSS_QUARTER as QUARTER_DS,
   LK_DATE.ID_MONTH as MONTH_ID,LK_MONTH572.DSL_MONTH as MONTH_DS,
    NVL(SUM((   DocVenditaDettaglio.PrzMedioPond  *  DocVenditaDettaglio.Quantita   )),0)  AS RCLICOSTORADIRETTA_2023_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda461,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.BasketMLIAnnuo BasketMLIAnnuo394,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodMarcaRicambi CodMarcaRicambi398,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodTipoRicambio CodTipoRicambio399,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH572,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER573,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR574,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.ZonaVenditaCM ZonaVenditaCM462
 WHERE
   (      BasketMLIAnnuo394.CodiceMercato = 'IT'   AND    CodMarcaRicambi398.Codice = 'FO'  AND    DocVenditaIntestazione.FlagAnnullata = 'A'  AND DocVenditaDettaglio.CancellatStampa = 'S' )
   AND   (    Azienda461.Id_CasaMadre = 1 AND Azienda461.CodMercato = 'IT'  AND Azienda461.IsDealer = 1 )
   AND   (    CodTipoRicambio399.Codice IN ( '001' , '002' , '003' , '009' , '010' , '027' , '029' , '032' , '033' , '034' , '036' , '041' , '044' , '045' , '046' , '049' , '050' , '052' , '054' , '057' , '060' , '062' , '067' , '068' , '069' , '070' , '073' , '081' , '083' , '084' , '085' , '087' , '091' , '093' , '095' , '096' , '098' , '099' , '100' , '102' , '103' , '105' , '109' , '110' , '111' , '112' , '114' , '116' , '117' , '118' , '119' , '120' , '122' , '124' , '127' , '129' , '131' , '132' , '138' , '139' , '141' , '143' , '144' , '146' , '148' , '149' , '157' , '158' , '164' , '165' , '166' , '171' , '172' , '175' , '176' , '177' , '178' , '183' , '185' , '186' , '187' , '188' , '189' , '191' , '192' , '193' , '195' , '197' , '198' , '204' , '219' , '223' , '229' , '254' , '285' , '288' , '322' , '329' , '385' , '408' , '415' , '426' , '427' , '434' , '435' , '436' , '456' , '470' , '471' , '472' , '474' , '480' , '501' , '502' , '506' , '507' , '508' , '512' , '513' , '517' , '522' , '524' , '526' , '528' , '529' , '530' , '537' , '539' , '543' , '548' , '550' , '552' , '553' , '555' , '558' , '560' , '567' , '592' , '598' , '613' , '614' , '616' , '621' , '624' , '628' , '631' , '632' , '635' , '642' , '644' , '650' , '658' , '662' , '668' , '672' , '673' , '684' , '685' , '701' , '702' , '703' , '704' , '706' , '707' , '708' , '709' , '710' , '711' , '712' , '730' , '751' , '753' , '754' , '755' , '758' , '761' , '763' )  OR ( Azienda461.CodDealerCM ||  CodTipoRicambio399.Codice ) IN ( '20100612'  , '48500612' )  )
   AND   (    DocVenditaDettaglio.id_RapportoClienteCM = 2 )
   AND   (    DocVenditaIntestazione.id_CodCatAteco NOT IN ( 1071 , 525 , 722 , 1081 )  )
   AND   (    DocVenditaIntestazione.id_CodSedeDealer NOT IN ( 166837 )  )
   AND   (   ( DocVenditaIntestazione.VAT || DocVenditaDettaglio.id_RapportoClienteCM ) NOT IN ( 'IT027949302772' , 'IT027949302773' , 'IT033357602314' , 'IT019249610044' , 'IT049111904884' , 'IT011555103975' )   OR DocVenditaIntestazione.VAT is null   )
   AND   (   Azienda461.Attiva = 1  )
   AND   (   LK_DATE.ID_MONTH >= 201901  )
   AND   Azienda461.id=DocVenditaIntestazione.id_Azienda
   AND   BasketMLIAnnuo394.CodiceMLI=CodTipoRicambio399.Codice
   AND   CodMarcaRicambi398.id=DocVenditaDettaglio.id_CodMarcaRicambi
   AND   CodMarcaRicambi398.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   CodTipoRicambio399.id=DocVenditaDettaglio.Id_CodTipoRicambio
   AND   CodTipoRicambio399.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_MONTH572.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER573.ID_QUARTER=LK_MONTH572.ID_QUARTER
   AND   LK_YEAR574.ID_YEAR=LK_QUARTER573.ID_YEAR
   AND   ZonaVenditaCM462.id=Azienda461.id_ZonaVenditaCM
GROUP BY
   ZonaVenditaCM462.id_AreaVenditaCM,
   ZonaVenditaCM462.Descrizione,
   Azienda461.id_ZonaVenditaCM,
   Azienda461.CodDealerCM,
   Azienda461.id,
   Azienda461.descrizione,
   ZonaVenditaCM462.Codice,
   DocVenditaIntestazione.id_Azienda,
   LK_QUARTER573.ID_YEAR,
   LK_YEAR574.DSS_YEAR,
   LK_MONTH572.ID_QUARTER,
   LK_QUARTER573.DSS_QUARTER,
   LK_DATE.ID_MONTH,
   LK_MONTH572.DSL_MONTH
;

--\* Creazione tabella per il calcolo delle metriche:[obj Rapporto Cliente - Clienti P.Iva] */
CREATE TABLE decisyon_cache.DX170531268549932418@<AUTOMOTIVE_BI_DATA/> AS SELECT
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_ID,Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_DS,
   Azienda461.id as RCLI_A_DSAZIENDA_Q_ID,Azienda461.descrizione as RCLI_A_DSAZIENDA_Q_DS,
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_PB_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_PB_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_Z_ZONA_PB_Q_ID,ZonaVenditaCM462.Codice as RCLI_Z_ZONA_PB_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_DS,
   Obj_RapportoCliCMQ.id_Azienda as RCLI_A_DS_PB_Q_ID,Azienda461.descrizione as RCLI_A_DS_PB_Q_DS,
   LK_QUARTER573.ID_YEAR as YEAR_ID,LK_YEAR574.DSS_YEAR as YEAR_DS,
   Obj_RapportoCliCMQ.ID_QUARTER as QUARTER_ID,LK_QUARTER573.DSS_QUARTER as QUARTER_DS,
   LK_MONTH572.ID_MONTH as MONTH_ID,LK_MONTH572.DSL_MONTH as MONTH_DS,
    NVL(AVG(Obj_RapportoCliCMQ.Importo),0)  AS OBJRAPPORTOCLI_4_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda461,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH572,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER573,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR574,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Obj_RapportoCliCMQ Obj_RapportoCliCMQ,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.ZonaVenditaCM ZonaVenditaCM462
 WHERE
   (    Azienda461.Id_CasaMadre = 1 AND Azienda461.CodMercato = 'IT'  AND Azienda461.IsDealer = 1 )
   AND   (    DocVenditaIntestazione.id_CodSedeDealer NOT IN ( 166837 )  )
   AND   (    Obj_RapportoCliCMQ.id_RapportoClienteCM = 4  )
   AND   (   ( DocVenditaIntestazione.VAT || DocVenditaDettaglio.id_RapportoClienteCM ) NOT IN ( 'IT027949302772' , 'IT027949302773' , 'IT033357602314' , 'IT019249610044' , 'IT049111904884' , 'IT011555103975' )   OR DocVenditaIntestazione.VAT is null   )
   AND   (   Azienda461.Attiva = 1  )
   AND   (   LK_MONTH572.ID_MONTH >= 201901  )
   AND   Azienda461.id=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_QUARTER573.ID_QUARTER=LK_MONTH572.ID_QUARTER
   AND   LK_YEAR574.ID_YEAR=LK_QUARTER573.ID_YEAR
   AND   Obj_RapportoCliCMQ.ID_QUARTER=LK_QUARTER573.ID_QUARTER
   AND   Obj_RapportoCliCMQ.id_Azienda=Azienda461.id
   AND   Obj_RapportoCliCMQ.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   Obj_RapportoCliCMQ.id_RapportoClienteCM=DocVenditaDettaglio.id_RapportoClienteCM
   AND   ZonaVenditaCM462.id=Azienda461.id_ZonaVenditaCM
GROUP BY
   ZonaVenditaCM462.id_AreaVenditaCM,
   ZonaVenditaCM462.Descrizione,
   Azienda461.id_ZonaVenditaCM,
   Azienda461.CodDealerCM,
   Azienda461.id,
   Azienda461.descrizione,
   ZonaVenditaCM462.Codice,
   Obj_RapportoCliCMQ.id_Azienda,
   LK_QUARTER573.ID_YEAR,
   LK_YEAR574.DSS_YEAR,
   Obj_RapportoCliCMQ.ID_QUARTER,
   LK_QUARTER573.DSS_QUARTER,
   LK_MONTH572.ID_MONTH,
   LK_MONTH572.DSL_MONTH
;




--\* Creazione tabella per il calcolo delle metriche:[obj Rapporto Cliente - R.Aut. Officine] */
CREATE TABLE decisyon_cache.DX170531268550766319@<AUTOMOTIVE_BI_DATA/> AS SELECT
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_ID,Azienda461.id_ZonaVenditaCM as RCLI_A_ZONAVENDITA_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_Q_DS,
   Azienda461.id as RCLI_A_DSAZIENDA_Q_ID,Azienda461.descrizione as RCLI_A_DSAZIENDA_Q_DS,
   ZonaVenditaCM462.id_AreaVenditaCM as RCLI_Z_AREA_PB_Q_ID,ZonaVenditaCM462.Descrizione as RCLI_Z_AREA_PB_Q_DS,
   Azienda461.id_ZonaVenditaCM as RCLI_Z_ZONA_PB_Q_ID,ZonaVenditaCM462.Codice as RCLI_Z_ZONA_PB_Q_DS,
   Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_ID,Azienda461.CodDealerCM as RCLI_A_CODFORD_PB_Q_DS,
   Obj_RapportoCliCMQ.id_Azienda as RCLI_A_DS_PB_Q_ID,Azienda461.descrizione as RCLI_A_DS_PB_Q_DS,
   LK_QUARTER573.ID_YEAR as YEAR_ID,LK_YEAR574.DSS_YEAR as YEAR_DS,
   Obj_RapportoCliCMQ.ID_QUARTER as QUARTER_ID,LK_QUARTER573.DSS_QUARTER as QUARTER_DS,
   LK_MONTH572.ID_MONTH as MONTH_ID,LK_MONTH572.DSL_MONTH as MONTH_DS,
    NVL(AVG(Obj_RapportoCliCMQ.Importo),0)  AS OBJRAPPORTOCLI_2_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda461,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH572,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER573,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR574,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Obj_RapportoCliCMQ Obj_RapportoCliCMQ,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.ZonaVenditaCM ZonaVenditaCM462
 WHERE
   (    Azienda461.Id_CasaMadre = 1 AND Azienda461.CodMercato = 'IT'  AND Azienda461.IsDealer = 1 )
   AND   (    DocVenditaIntestazione.id_CodSedeDealer NOT IN ( 166837 )  )
   AND   (    Obj_RapportoCliCMQ.id_RapportoClienteCM = 2  )
   AND   (   ( DocVenditaIntestazione.VAT || DocVenditaDettaglio.id_RapportoClienteCM ) NOT IN ( 'IT027949302772' , 'IT027949302773' , 'IT033357602314' , 'IT019249610044' , 'IT049111904884' , 'IT011555103975' )   OR DocVenditaIntestazione.VAT is null   )
   AND   (   Azienda461.Attiva = 1  )
   AND   (   LK_MONTH572.ID_MONTH >= 201901  )
   AND   Azienda461.id=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_QUARTER573.ID_QUARTER=LK_MONTH572.ID_QUARTER
   AND   LK_YEAR574.ID_YEAR=LK_QUARTER573.ID_YEAR
   AND   Obj_RapportoCliCMQ.ID_QUARTER=LK_QUARTER573.ID_QUARTER
   AND   Obj_RapportoCliCMQ.id_Azienda=Azienda461.id
   AND   Obj_RapportoCliCMQ.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   Obj_RapportoCliCMQ.id_RapportoClienteCM=DocVenditaDettaglio.id_RapportoClienteCM
   AND   ZonaVenditaCM462.id=Azienda461.id_ZonaVenditaCM
GROUP BY
   ZonaVenditaCM462.id_AreaVenditaCM,
   ZonaVenditaCM462.Descrizione,
   Azienda461.id_ZonaVenditaCM,
   Azienda461.CodDealerCM,
   Azienda461.id,
   Azienda461.descrizione,
   ZonaVenditaCM462.Codice,
   Obj_RapportoCliCMQ.id_Azienda,
   LK_QUARTER573.ID_YEAR,
   LK_YEAR574.DSS_YEAR,
   Obj_RapportoCliCMQ.ID_QUARTER,
   LK_QUARTER573.DSS_QUARTER,
   LK_MONTH572.ID_MONTH,
   LK_MONTH572.DSL_MONTH
;




--\* Creazione tabella temporanea contenente i valori dimensionali */
CREATE TABLE decisyon_cache.UX170531268550884621@<AUTOMOTIVE_BI_DATA/> AS SELECT
 decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID AS RCLI_Z_AREA_Q_ID,decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_DS AS RCLI_Z_AREA_Q_DS,
 decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID AS RCLI_A_ZONAVENDITA_Q_ID,decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_DS AS RCLI_A_ZONAVENDITA_Q_DS,
 decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID AS RCLI_A_CODFORD_Q_ID,decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_DS AS RCLI_A_CODFORD_Q_DS,
 decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID AS RCLI_A_DSAZIENDA_Q_ID,decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_DS AS RCLI_A_DSAZIENDA_Q_DS,
 decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID AS RCLI_Z_AREA_PB_Q_ID,decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_DS AS RCLI_Z_AREA_PB_Q_DS,
 decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID AS RCLI_Z_ZONA_PB_Q_ID,decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_DS AS RCLI_Z_ZONA_PB_Q_DS,
 decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID AS RCLI_A_CODFORD_PB_Q_ID,decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_DS AS RCLI_A_CODFORD_PB_Q_DS,
 decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID AS RCLI_A_DS_PB_Q_ID,decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_DS AS RCLI_A_DS_PB_Q_DS,
 decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AS YEAR_ID,decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.YEAR_DS AS YEAR_DS,
 decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AS QUARTER_ID,decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.QUARTER_DS AS QUARTER_DS,
 decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.MONTH_ID AS MONTH_ID,decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.MONTH_DS AS MONTH_DS
FROM decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX170531268550884621@<AUTOMOTIVE_BI_DATA/>
(RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS)
 SELECT
RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS  FROM decisyon_cache.DX170531268534563411@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX170531268550884621@<AUTOMOTIVE_BI_DATA/>
(RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS)
 SELECT
RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS  FROM decisyon_cache.DX170531268539125212@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX170531268550884621@<AUTOMOTIVE_BI_DATA/>
(RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS)
 SELECT
RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS  FROM decisyon_cache.DX170531268541045113@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX170531268550884621@<AUTOMOTIVE_BI_DATA/>
(RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS)
 SELECT
RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS  FROM decisyon_cache.DX170531268542436714@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX170531268550884621@<AUTOMOTIVE_BI_DATA/>
(RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS)
 SELECT
RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS  FROM decisyon_cache.DX170531268545823715@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX170531268550884621@<AUTOMOTIVE_BI_DATA/>
(RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS)
 SELECT
RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS  FROM decisyon_cache.DX170531268547316216@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX170531268550884621@<AUTOMOTIVE_BI_DATA/>
(RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS)
 SELECT
RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS  FROM decisyon_cache.DX170531268549113217@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX170531268550884621@<AUTOMOTIVE_BI_DATA/>
(RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS)
 SELECT
RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS  FROM decisyon_cache.DX170531268549932418@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX170531268550884621@<AUTOMOTIVE_BI_DATA/>
(RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS)
 SELECT
RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,YEAR_ID,YEAR_DS,QUARTER_ID,QUARTER_DS,MONTH_ID,MONTH_DS  FROM decisyon_cache.DX170531268550766319@<AUTOMOTIVE_BI_DATA/>;




--\* Creazione tabella temporanea finale contenente valori distinti */
CREATE TABLE decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/> AS SELECT DISTINCT
RCLI_Z_AREA_Q_ID,RCLI_Z_AREA_Q_DS,
RCLI_A_ZONAVENDITA_Q_ID,RCLI_A_ZONAVENDITA_Q_DS,
RCLI_A_CODFORD_Q_ID,RCLI_A_CODFORD_Q_DS,
RCLI_A_DSAZIENDA_Q_ID,RCLI_A_DSAZIENDA_Q_DS,
RCLI_Z_AREA_PB_Q_ID,RCLI_Z_AREA_PB_Q_DS,
RCLI_Z_ZONA_PB_Q_ID,RCLI_Z_ZONA_PB_Q_DS,
RCLI_A_CODFORD_PB_Q_ID,RCLI_A_CODFORD_PB_Q_DS,
RCLI_A_DS_PB_Q_ID,RCLI_A_DS_PB_Q_DS,
YEAR_ID,YEAR_DS,
QUARTER_ID,QUARTER_DS,
MONTH_ID,MONTH_DS FROM decisyon_cache.UX170531268550884621@<AUTOMOTIVE_BI_DATA/>;




--\* Creazione del datamart finale */
CREATE TABLE decisyon_cache.FX170531268551000522@<AUTOMOTIVE_BI_DATA/> AS SELECT
   decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID,decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_DS,
   decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID,decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_DS,
   decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID,decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_DS,
   decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID,decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_DS,
   decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID,decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_DS,
   decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID,decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_DS,
   decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID,decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_DS,
   decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID,decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_DS,
   decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.YEAR_ID,decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.YEAR_DS,
   decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID,decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.QUARTER_DS,
   decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.MONTH_ID,decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.MONTH_DS,
    NVL(RCLICOSTORADIRETTA_2023_,0)  AS RCLICOSTORADIRETTA_2023_,
    NVL(RCLICOSTOALTRIFP5_2023_,0)  AS RCLICOSTOALTRIFP5_2023_,
    NVL(RCLICOSTORAPPNPIVA_2023_,0)  AS RCLICOSTORAPPNPIVA_2023_,
    NVL(RCLIRICAVOVE_TOT_2023_,0)  AS RCLIRICAVOVE_TOT_2023_,
    NVL(RCLIRICAVORADIR_2_2023_,0)  AS RCLIRICAVORADIR_2_2023_,
    NVL(RCLICOSTORAINCROCI_2023_,0)  AS RCLICOSTORAINCROCI_2023_,
    NVL(RCLIRICRAINCR_3_2023_,0)  AS RCLIRICRAINCR_3_2023_,
    NVL(OBJRAPPORTOCLI_2_,0)  AS OBJRAPPORTOCLI_2_,
    NVL(OBJRAPPORTOCLI_4_,0)  AS OBJRAPPORTOCLI_4_,
    NVL(RCLICOSTORATOTALE_2023_,0)  AS RCLICOSTORATOTALE_2023_
FROM
   decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>
  left outer join decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID=decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID=decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID=decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID=decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID=decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID=decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID=decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID=decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX170531268530437810@<AUTOMOTIVE_BI_DATA/>.MONTH_ID)
  left outer join decisyon_cache.DX170531268534563411@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID=decisyon_cache.DX170531268534563411@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID=decisyon_cache.DX170531268534563411@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID=decisyon_cache.DX170531268534563411@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID=decisyon_cache.DX170531268534563411@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID=decisyon_cache.DX170531268534563411@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID=decisyon_cache.DX170531268534563411@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID=decisyon_cache.DX170531268534563411@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID=decisyon_cache.DX170531268534563411@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX170531268534563411@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX170531268534563411@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX170531268534563411@<AUTOMOTIVE_BI_DATA/>.MONTH_ID)
  left outer join decisyon_cache.DX170531268539125212@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID=decisyon_cache.DX170531268539125212@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID=decisyon_cache.DX170531268539125212@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID=decisyon_cache.DX170531268539125212@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID=decisyon_cache.DX170531268539125212@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID=decisyon_cache.DX170531268539125212@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID=decisyon_cache.DX170531268539125212@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID=decisyon_cache.DX170531268539125212@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID=decisyon_cache.DX170531268539125212@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX170531268539125212@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX170531268539125212@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX170531268539125212@<AUTOMOTIVE_BI_DATA/>.MONTH_ID)
  left outer join decisyon_cache.DX170531268541045113@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID=decisyon_cache.DX170531268541045113@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID=decisyon_cache.DX170531268541045113@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID=decisyon_cache.DX170531268541045113@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID=decisyon_cache.DX170531268541045113@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID=decisyon_cache.DX170531268541045113@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID=decisyon_cache.DX170531268541045113@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID=decisyon_cache.DX170531268541045113@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID=decisyon_cache.DX170531268541045113@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX170531268541045113@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX170531268541045113@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX170531268541045113@<AUTOMOTIVE_BI_DATA/>.MONTH_ID)
  left outer join decisyon_cache.DX170531268542436714@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID=decisyon_cache.DX170531268542436714@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID=decisyon_cache.DX170531268542436714@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID=decisyon_cache.DX170531268542436714@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID=decisyon_cache.DX170531268542436714@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID=decisyon_cache.DX170531268542436714@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID=decisyon_cache.DX170531268542436714@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID=decisyon_cache.DX170531268542436714@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID=decisyon_cache.DX170531268542436714@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX170531268542436714@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX170531268542436714@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX170531268542436714@<AUTOMOTIVE_BI_DATA/>.MONTH_ID)
  left outer join decisyon_cache.DX170531268545823715@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID=decisyon_cache.DX170531268545823715@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID=decisyon_cache.DX170531268545823715@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID=decisyon_cache.DX170531268545823715@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID=decisyon_cache.DX170531268545823715@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID=decisyon_cache.DX170531268545823715@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID=decisyon_cache.DX170531268545823715@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID=decisyon_cache.DX170531268545823715@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID=decisyon_cache.DX170531268545823715@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX170531268545823715@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX170531268545823715@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX170531268545823715@<AUTOMOTIVE_BI_DATA/>.MONTH_ID)
  left outer join decisyon_cache.DX170531268547316216@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID=decisyon_cache.DX170531268547316216@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID=decisyon_cache.DX170531268547316216@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID=decisyon_cache.DX170531268547316216@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID=decisyon_cache.DX170531268547316216@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID=decisyon_cache.DX170531268547316216@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID=decisyon_cache.DX170531268547316216@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID=decisyon_cache.DX170531268547316216@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID=decisyon_cache.DX170531268547316216@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX170531268547316216@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX170531268547316216@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX170531268547316216@<AUTOMOTIVE_BI_DATA/>.MONTH_ID)
  left outer join decisyon_cache.DX170531268549113217@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID=decisyon_cache.DX170531268549113217@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID=decisyon_cache.DX170531268549113217@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID=decisyon_cache.DX170531268549113217@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID=decisyon_cache.DX170531268549113217@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID=decisyon_cache.DX170531268549113217@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID=decisyon_cache.DX170531268549113217@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID=decisyon_cache.DX170531268549113217@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID=decisyon_cache.DX170531268549113217@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX170531268549113217@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX170531268549113217@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX170531268549113217@<AUTOMOTIVE_BI_DATA/>.MONTH_ID)
  left outer join decisyon_cache.DX170531268549932418@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID=decisyon_cache.DX170531268549932418@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID=decisyon_cache.DX170531268549932418@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID=decisyon_cache.DX170531268549932418@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID=decisyon_cache.DX170531268549932418@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID=decisyon_cache.DX170531268549932418@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID=decisyon_cache.DX170531268549932418@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID=decisyon_cache.DX170531268549932418@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID=decisyon_cache.DX170531268549932418@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX170531268549932418@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX170531268549932418@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX170531268549932418@<AUTOMOTIVE_BI_DATA/>.MONTH_ID)
  left outer join decisyon_cache.DX170531268550766319@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID=decisyon_cache.DX170531268550766319@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID=decisyon_cache.DX170531268550766319@<AUTOMOTIVE_BI_DATA/>.RCLI_A_ZONAVENDITA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID=decisyon_cache.DX170531268550766319@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID=decisyon_cache.DX170531268550766319@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DSAZIENDA_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID=decisyon_cache.DX170531268550766319@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_AREA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID=decisyon_cache.DX170531268550766319@<AUTOMOTIVE_BI_DATA/>.RCLI_Z_ZONA_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID=decisyon_cache.DX170531268550766319@<AUTOMOTIVE_BI_DATA/>.RCLI_A_CODFORD_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID=decisyon_cache.DX170531268550766319@<AUTOMOTIVE_BI_DATA/>.RCLI_A_DS_PB_Q_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX170531268550766319@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX170531268550766319@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AND
     decisyon_cache.UX170531268550825620@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX170531268550766319@<AUTOMOTIVE_BI_DATA/>.MONTH_ID)
;




--\* Ricerca CubeView:[rCliCostoRADiretta_2023] */
;




--\* Ricerca CubeView:[obj Rapporto Cliente - Clienti P.Iva] */
;




--\* Ricerca CubeView:[rCliRicRAIncr_3_2023] */
;




--\* Ricerca CubeView:[rCliCostoRAIncroci_2023] */
;




--\* Ricerca CubeView:[rCliRicavoVE_tot_2023] */
;




--\* Ricerca CubeView:[rCliCostoRappNPIVA_2023] */
;




--\* Ricerca CubeView:[rCliRicavoRADir_2_2023] */
;




--\* Ricerca CubeView:[rCliCostoAltriFP5_2023] */
;




--\* Ricerca CubeView:[rCliCostoRATotale_2023] */
;




--\* Ricerca CubeView:[obj Rapporto Cliente - R.Aut. Officine] */
;

