



--\* Creazione tabella per il calcolo delle metriche:[netto_format_ly] */
CREATE TABLE decisyon_cache.DX167274247274073326@<AUTOMOTIVE_BI_DATA/> AS SELECT
   Azienda34.CodDealerCM as AZ_CODFORD_ID,Azienda34.CodDealerCM as AZ_CODFORD_DS,
   DocVenditaDettaglio.id_Azienda as DESCRIZIONE_AZIENDA_ID,Azienda625.descrizione as DESCRIZIONE_AZIENDA_DS,
   LK_YEAR565.ID_YEAR as YEAR_ID,LK_YEAR565.DSS_YEAR as YEAR_DS,
    NVL(SUM(DocVenditaDettaglio.NettoRiga),0)  AS NETTO_FORMAT_LY_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda296,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda34,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda625,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodSedeDealer CodSedeDealer298,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH563,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER564,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR565
 WHERE
   (    Azienda296.IsDealer = 1  AND  Azienda296.CodMercato = 'IT'  AND  Azienda296.Id_CasaMadre = 1  )
   AND   (    DocVenditaDettaglio.CancellatStampa = 'S'  )
   AND   (    DocVenditaIntestazione.FlagAnnullata = 'A'  )
   AND   (   Azienda625.id = 473  )
   AND   (   LK_MONTH563.ID_MONTH  >= 202210 )
   AND   Azienda296.id=CodSedeDealer298.id_Azienda
   AND   CodSedeDealer298.id=DocVenditaIntestazione.id_CodSedeDealer
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=Azienda34.id
   AND   DocVenditaDettaglio.id_Azienda=Azienda625.id
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_MONTH563.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER564.ID_QUARTER=LK_MONTH563.ID_QUARTER
   AND   LK_QUARTER564.ID_YEAR=LK_YEAR565.TRANS_LY
GROUP BY
   Azienda34.CodDealerCM,
   DocVenditaDettaglio.id_Azienda,
   Azienda625.descrizione,
   LK_YEAR565.ID_YEAR,
   LK_YEAR565.DSS_YEAR
;




--\* Creazione tabella per il calcolo delle metriche:[netto_format] */
CREATE TABLE decisyon_cache.DX167274247275462627@<AUTOMOTIVE_BI_DATA/> AS SELECT
   Azienda34.CodDealerCM as AZ_CODFORD_ID,Azienda34.CodDealerCM as AZ_CODFORD_DS,
   DocVenditaDettaglio.id_Azienda as DESCRIZIONE_AZIENDA_ID,Azienda625.descrizione as DESCRIZIONE_AZIENDA_DS,
   LK_QUARTER564.ID_YEAR as YEAR_ID,LK_YEAR565.DSS_YEAR as YEAR_DS,
    NVL(SUM(DocVenditaDettaglio.NettoRiga),0)  AS NETTO_FORMAT_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda296,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda34,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda625,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodSedeDealer CodSedeDealer298,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH563,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER564,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR565
 WHERE
   (    Azienda296.IsDealer = 1  AND  Azienda296.CodMercato = 'IT'  AND  Azienda296.Id_CasaMadre = 1  )
   AND   (    DocVenditaDettaglio.CancellatStampa = 'S'  )
   AND   (    DocVenditaIntestazione.FlagAnnullata = 'A'  )
   AND   (   DocVenditaDettaglio.id_Azienda = 473  )
   AND   (   LK_DATE.ID_MONTH  >= 202210 )
   AND   Azienda296.id=CodSedeDealer298.id_Azienda
   AND   CodSedeDealer298.id=DocVenditaIntestazione.id_CodSedeDealer
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=Azienda34.id
   AND   DocVenditaDettaglio.id_Azienda=Azienda625.id
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   DocVenditaIntestazione.NumRifInt=DocVenditaDettaglio.NumRifInt
   AND   DocVenditaIntestazione.id_Azienda=DocVenditaDettaglio.id_Azienda
   AND   LK_MONTH563.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER564.ID_QUARTER=LK_MONTH563.ID_QUARTER
   AND   LK_YEAR565.ID_YEAR=LK_QUARTER564.ID_YEAR
GROUP BY
   Azienda34.CodDealerCM,
   DocVenditaDettaglio.id_Azienda,
   Azienda625.descrizione,
   LK_QUARTER564.ID_YEAR,
   LK_YEAR565.DSS_YEAR
;




--\* Creazione tabella temporanea contenente i valori dimensionali */
CREATE TABLE decisyon_cache.UX167274247275570029@<AUTOMOTIVE_BI_DATA/> AS SELECT
 decisyon_cache.DX167274247274073326@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_ID AS AZ_CODFORD_ID,decisyon_cache.DX167274247274073326@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_DS AS AZ_CODFORD_DS,
 decisyon_cache.DX167274247274073326@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_ID AS DESCRIZIONE_AZIENDA_ID,decisyon_cache.DX167274247274073326@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_DS AS DESCRIZIONE_AZIENDA_DS,
 decisyon_cache.DX167274247274073326@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AS YEAR_ID,decisyon_cache.DX167274247274073326@<AUTOMOTIVE_BI_DATA/>.YEAR_DS AS YEAR_DS
FROM decisyon_cache.DX167274247274073326@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX167274247275570029@<AUTOMOTIVE_BI_DATA/>
(AZ_CODFORD_ID,AZ_CODFORD_DS,DESCRIZIONE_AZIENDA_ID,DESCRIZIONE_AZIENDA_DS,YEAR_ID,YEAR_DS)
 SELECT
AZ_CODFORD_ID,AZ_CODFORD_DS,DESCRIZIONE_AZIENDA_ID,DESCRIZIONE_AZIENDA_DS,YEAR_ID,YEAR_DS  FROM decisyon_cache.DX167274247275462627@<AUTOMOTIVE_BI_DATA/>;




--\* Creazione tabella temporanea finale contenente valori distinti */
CREATE TABLE decisyon_cache.UX167274247275506628@<AUTOMOTIVE_BI_DATA/> AS SELECT DISTINCT
AZ_CODFORD_ID,AZ_CODFORD_DS,
DESCRIZIONE_AZIENDA_ID,DESCRIZIONE_AZIENDA_DS,
YEAR_ID,YEAR_DS FROM decisyon_cache.UX167274247275570029@<AUTOMOTIVE_BI_DATA/>;




--\* Creazione del datamart finale */
CREATE TABLE decisyon_cache.FX167274247275588730@<AUTOMOTIVE_BI_DATA/> AS SELECT
   decisyon_cache.UX167274247275506628@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_ID,decisyon_cache.UX167274247275506628@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_DS,
   decisyon_cache.UX167274247275506628@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_ID,decisyon_cache.UX167274247275506628@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_DS,
   decisyon_cache.UX167274247275506628@<AUTOMOTIVE_BI_DATA/>.YEAR_ID,decisyon_cache.UX167274247275506628@<AUTOMOTIVE_BI_DATA/>.YEAR_DS,
    NVL(NETTO_FORMAT_,0)  AS NETTO_FORMAT_,
    NVL(NETTO_FORMAT_LY_,0)  AS NETTO_FORMAT_LY_
FROM
   decisyon_cache.UX167274247275506628@<AUTOMOTIVE_BI_DATA/>
  left outer join decisyon_cache.DX167274247274073326@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX167274247275506628@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_ID=decisyon_cache.DX167274247274073326@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_ID AND
     decisyon_cache.UX167274247275506628@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_ID=decisyon_cache.DX167274247274073326@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_ID AND
     decisyon_cache.UX167274247275506628@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX167274247274073326@<AUTOMOTIVE_BI_DATA/>.YEAR_ID)
  left outer join decisyon_cache.DX167274247275462627@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX167274247275506628@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_ID=decisyon_cache.DX167274247275462627@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_ID AND
     decisyon_cache.UX167274247275506628@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_ID=decisyon_cache.DX167274247275462627@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_ID AND
     decisyon_cache.UX167274247275506628@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX167274247275462627@<AUTOMOTIVE_BI_DATA/>.YEAR_ID)
;




--\* Ricerca CubeView:[netto_format] */
;




--\* Ricerca CubeView:[netto_format_ly] */
;

