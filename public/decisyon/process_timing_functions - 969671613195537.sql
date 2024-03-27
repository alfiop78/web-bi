



--\* Creazione tabella per il calcolo delle metriche:[Venduto LP] */
CREATE TABLE decisyon_cache.DX171153027729742074@<AUTOMOTIVE_BI_DATA/> AS SELECT
   Azienda34.CodDealerCM as AZ_CODFORD_ID,Azienda34.CodDealerCM as AZ_CODFORD_DS,
   DocVenditaDettaglio.id_Azienda as DESCRIZIONE_AZIENDA_ID,Azienda640.descrizione as DESCRIZIONE_AZIENDA_DS,
   LK_QUARTER576.ID_YEAR as YEAR_ID,LK_YEAR577.DSS_YEAR as YEAR_DS,
   LK_MONTH575.ID_MONTH as MONTH_ID,LK_MONTH575.DSL_MONTH as MONTH_DS,
    NVL(SUM(DocVenditaDettaglio.NettoRiga),0)  AS VENDUTO_LAST_PERIOD_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda34,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda640,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH575,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER576,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR577
 WHERE
   (   Azienda640.id = 473  )
   AND   (   LK_MONTH575.ID_MONTH  = 202402  )
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.id_Azienda=Azienda34.id
   AND   DocVenditaDettaglio.id_Azienda=Azienda640.id
   AND   LK_DATE.ID_MONTH=LK_MONTH575.TRANS_PREV
   AND   LK_QUARTER576.ID_QUARTER=LK_MONTH575.ID_QUARTER
   AND   LK_YEAR577.ID_YEAR=LK_QUARTER576.ID_YEAR
GROUP BY
   Azienda34.CodDealerCM,
   DocVenditaDettaglio.id_Azienda,
   Azienda640.descrizione,
   LK_QUARTER576.ID_YEAR,
   LK_YEAR577.DSS_YEAR,
   LK_MONTH575.ID_MONTH,
   LK_MONTH575.DSL_MONTH
;




--\* Creazione tabella per il calcolo delle metriche:[netto_format_ly] */
CREATE TABLE decisyon_cache.DX171153027729738275@<AUTOMOTIVE_BI_DATA/> AS SELECT
   Azienda34.CodDealerCM as AZ_CODFORD_ID,Azienda34.CodDealerCM as AZ_CODFORD_DS,
   DocVenditaDettaglio.id_Azienda as DESCRIZIONE_AZIENDA_ID,Azienda640.descrizione as DESCRIZIONE_AZIENDA_DS,
   LK_QUARTER576.ID_YEAR as YEAR_ID,LK_YEAR577.DSS_YEAR as YEAR_DS,
   LK_MONTH575.ID_MONTH as MONTH_ID,LK_MONTH575.DSL_MONTH as MONTH_DS,
    NVL(SUM(DocVenditaDettaglio.NettoRiga),0)  AS NETTO_FORMAT_LY_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda34,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda640,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH575,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER576,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR577
 WHERE
   (   Azienda640.id = 473  )
   AND   (   LK_MONTH575.ID_MONTH  = 202402  )
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.id_Azienda=Azienda34.id
   AND   DocVenditaDettaglio.id_Azienda=Azienda640.id
   AND   LK_DATE.ID_MONTH=LK_MONTH575.TRANS_LY
   AND   LK_QUARTER576.ID_QUARTER=LK_MONTH575.ID_QUARTER
   AND   LK_YEAR577.ID_YEAR=LK_QUARTER576.ID_YEAR
GROUP BY
   Azienda34.CodDealerCM,
   DocVenditaDettaglio.id_Azienda,
   Azienda640.descrizione,
   LK_QUARTER576.ID_YEAR,
   LK_YEAR577.DSS_YEAR,
   LK_MONTH575.ID_MONTH,
   LK_MONTH575.DSL_MONTH
;




--\* Creazione tabella per il calcolo delle metriche:[Venduto] */
CREATE TABLE decisyon_cache.DX171153027729746876@<AUTOMOTIVE_BI_DATA/> AS SELECT
   Azienda34.CodDealerCM as AZ_CODFORD_ID,Azienda34.CodDealerCM as AZ_CODFORD_DS,
   DocVenditaDettaglio.id_Azienda as DESCRIZIONE_AZIENDA_ID,Azienda640.descrizione as DESCRIZIONE_AZIENDA_DS,
   LK_QUARTER576.ID_YEAR as YEAR_ID,LK_YEAR577.DSS_YEAR as YEAR_DS,
   LK_DATE.ID_MONTH as MONTH_ID,LK_MONTH575.DSL_MONTH as MONTH_DS,
   SUM(DocVenditaDettaglio.NettoRiga) AS NETTORIGA_SUM_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda34,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda640,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH575,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER576,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_YEAR LK_YEAR577
 WHERE
   (   DocVenditaDettaglio.id_Azienda = 473  )
   AND   (   LK_DATE.ID_MONTH  = 202402  )
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.id_Azienda=Azienda34.id
   AND   DocVenditaDettaglio.id_Azienda=Azienda640.id
   AND   LK_MONTH575.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER576.ID_QUARTER=LK_MONTH575.ID_QUARTER
   AND   LK_YEAR577.ID_YEAR=LK_QUARTER576.ID_YEAR
GROUP BY
   Azienda34.CodDealerCM,
   DocVenditaDettaglio.id_Azienda,
   Azienda640.descrizione,
   LK_QUARTER576.ID_YEAR,
   LK_YEAR577.DSS_YEAR,
   LK_DATE.ID_MONTH,
   LK_MONTH575.DSL_MONTH
;




--\* Creazione tabella temporanea contenente i valori dimensionali */
CREATE TABLE decisyon_cache.UX171153027731342078@<AUTOMOTIVE_BI_DATA/> AS SELECT
 decisyon_cache.DX171153027729742074@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_ID AS AZ_CODFORD_ID,decisyon_cache.DX171153027729742074@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_DS AS AZ_CODFORD_DS,
 decisyon_cache.DX171153027729742074@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_ID AS DESCRIZIONE_AZIENDA_ID,decisyon_cache.DX171153027729742074@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_DS AS DESCRIZIONE_AZIENDA_DS,
 decisyon_cache.DX171153027729742074@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AS YEAR_ID,decisyon_cache.DX171153027729742074@<AUTOMOTIVE_BI_DATA/>.YEAR_DS AS YEAR_DS,
 decisyon_cache.DX171153027729742074@<AUTOMOTIVE_BI_DATA/>.MONTH_ID AS MONTH_ID,decisyon_cache.DX171153027729742074@<AUTOMOTIVE_BI_DATA/>.MONTH_DS AS MONTH_DS
FROM decisyon_cache.DX171153027729742074@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX171153027731342078@<AUTOMOTIVE_BI_DATA/>
(AZ_CODFORD_ID,AZ_CODFORD_DS,DESCRIZIONE_AZIENDA_ID,DESCRIZIONE_AZIENDA_DS,YEAR_ID,YEAR_DS,MONTH_ID,MONTH_DS)
 SELECT
AZ_CODFORD_ID,AZ_CODFORD_DS,DESCRIZIONE_AZIENDA_ID,DESCRIZIONE_AZIENDA_DS,YEAR_ID,YEAR_DS,MONTH_ID,MONTH_DS  FROM decisyon_cache.DX171153027729738275@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX171153027731342078@<AUTOMOTIVE_BI_DATA/>
(AZ_CODFORD_ID,AZ_CODFORD_DS,DESCRIZIONE_AZIENDA_ID,DESCRIZIONE_AZIENDA_DS,YEAR_ID,YEAR_DS,MONTH_ID,MONTH_DS)
 SELECT
AZ_CODFORD_ID,AZ_CODFORD_DS,DESCRIZIONE_AZIENDA_ID,DESCRIZIONE_AZIENDA_DS,YEAR_ID,YEAR_DS,MONTH_ID,MONTH_DS  FROM decisyon_cache.DX171153027729746876@<AUTOMOTIVE_BI_DATA/>;




--\* Creazione tabella temporanea finale contenente valori distinti */
CREATE TABLE decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/> AS SELECT DISTINCT
AZ_CODFORD_ID,AZ_CODFORD_DS,
DESCRIZIONE_AZIENDA_ID,DESCRIZIONE_AZIENDA_DS,
YEAR_ID,YEAR_DS,
MONTH_ID,MONTH_DS FROM decisyon_cache.UX171153027731342078@<AUTOMOTIVE_BI_DATA/>;




--\* Creazione del datamart finale */
CREATE TABLE decisyon_cache.FX171153027731312679@<AUTOMOTIVE_BI_DATA/> AS SELECT
   decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_ID,decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_DS,
   decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_ID,decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_DS,
   decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.YEAR_ID,decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.YEAR_DS,
   decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.MONTH_ID,decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.MONTH_DS,
   NETTORIGA_SUM_ AS NETTORIGA_SUM_,
    NVL(NETTO_FORMAT_LY_,0)  AS NETTO_FORMAT_LY_,
    NVL(VENDUTO_LAST_PERIOD_,0)  AS VENDUTO_LAST_PERIOD_
FROM
   decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>
  left outer join decisyon_cache.DX171153027729742074@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_ID=decisyon_cache.DX171153027729742074@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_ID AND
     decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_ID=decisyon_cache.DX171153027729742074@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_ID AND
     decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX171153027729742074@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX171153027729742074@<AUTOMOTIVE_BI_DATA/>.MONTH_ID)
  left outer join decisyon_cache.DX171153027729738275@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_ID=decisyon_cache.DX171153027729738275@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_ID AND
     decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_ID=decisyon_cache.DX171153027729738275@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_ID AND
     decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX171153027729738275@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX171153027729738275@<AUTOMOTIVE_BI_DATA/>.MONTH_ID)
  left outer join decisyon_cache.DX171153027729746876@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_ID=decisyon_cache.DX171153027729746876@<AUTOMOTIVE_BI_DATA/>.AZ_CODFORD_ID AND
     decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_ID=decisyon_cache.DX171153027729746876@<AUTOMOTIVE_BI_DATA/>.DESCRIZIONE_AZIENDA_ID AND
     decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.YEAR_ID=decisyon_cache.DX171153027729746876@<AUTOMOTIVE_BI_DATA/>.YEAR_ID AND
     decisyon_cache.UX171153027731323377@<AUTOMOTIVE_BI_DATA/>.MONTH_ID=decisyon_cache.DX171153027729746876@<AUTOMOTIVE_BI_DATA/>.MONTH_ID)
;




--\* Ricerca CubeView:[Venduto LP] */
;




--\* Ricerca CubeView:[Venduto] */
;




--\* Ricerca CubeView:[netto_format_ly] */
;
