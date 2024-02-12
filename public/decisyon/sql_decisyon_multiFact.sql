--\* Creazione tabella per il calcolo delle metriche:[web_bi_importo] */
CREATE TABLE decisyon_cache.DX170714970594138411@<AUTOMOTIVE_BI_DATA/> AS SELECT
   Obj_BUQuarter.id_Azienda as WEB_BI_DEALER_ID,Azienda641.descrizione as WEB_BI_DEALER_DS,
   Obj_BUQuarter.ID_QUARTER as QUARTER_ID,LK_QUARTER575.DSS_QUARTER as QUARTER_DS,
    NVL(SUM(Obj_BUQuarter.Importo),0)  AS WEB_BI_IMPORTO_SUM_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda641,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER575,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Obj_BUQuarter Obj_BUQuarter
 WHERE
   (   Obj_BUQuarter.ID_QUARTER IN ( 202303 , 202304 )  )
   AND   (   Obj_BUQuarter.id_Azienda = 437  )
   AND   Obj_BUQuarter.ID_QUARTER=LK_QUARTER575.ID_QUARTER
   AND   Obj_BUQuarter.id_Azienda=Azienda641.id
GROUP BY
   Obj_BUQuarter.id_Azienda,
   Azienda641.descrizione,
   Obj_BUQuarter.ID_QUARTER,
   LK_QUARTER575.DSS_QUARTER
;


--\* Creazione tabella per il calcolo delle metriche:[Nettoriga] */
CREATE TABLE decisyon_cache.DX170714970594101412@<AUTOMOTIVE_BI_DATA/> AS SELECT
   CodSedeDealer642.id_Azienda as WEB_BI_DEALER_ID,Azienda641.descrizione as WEB_BI_DEALER_DS,
   LK_MONTH574.ID_QUARTER as QUARTER_ID,LK_QUARTER575.DSS_QUARTER as QUARTER_DS,
    NVL(SUM(DocVenditaDettaglio.NettoRiga),0)  AS WEB_BI_NETTORIGA_SUM_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda641,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodSedeDealer CodSedeDealer642,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH574,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER575
 WHERE
   (   CodSedeDealer642.id_Azienda = 437  )
   AND   (   LK_MONTH574.ID_QUARTER IN ( 202303 , 202304 )  )
   AND   Azienda641.id=CodSedeDealer642.id_Azienda
   AND   CodSedeDealer642.id=DocVenditaIntestazione.id_CodSedeDealer
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   LK_MONTH574.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER575.ID_QUARTER=LK_MONTH574.ID_QUARTER
GROUP BY
   CodSedeDealer642.id_Azienda,
   Azienda641.descrizione,
   LK_MONTH574.ID_QUARTER,
   LK_QUARTER575.DSS_QUARTER
;


--\* Creazione tabella temporanea contenente i valori dimensionali */
-- qui vengono inseriti i dati della prima query (solo i valori dimensionale, senza metriche)
CREATE TABLE decisyon_cache.UX170714970594126214@<AUTOMOTIVE_BI_DATA/> AS SELECT
 decisyon_cache.DX170714970594138411@<AUTOMOTIVE_BI_DATA/>.WEB_BI_DEALER_ID AS WEB_BI_DEALER_ID,decisyon_cache.DX170714970594138411@<AUTOMOTIVE_BI_DATA/>.WEB_BI_DEALER_DS AS WEB_BI_DEALER_DS,
 decisyon_cache.DX170714970594138411@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AS QUARTER_ID,decisyon_cache.DX170714970594138411@<AUTOMOTIVE_BI_DATA/>.QUARTER_DS AS QUARTER_DS
FROM decisyon_cache.DX170714970594138411@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
-- ... nella stessa tabella (UX....) vengono aggiunti (INSERT) i dati della seconda query
INSERT INTO decisyon_cache.UX170714970594126214@<AUTOMOTIVE_BI_DATA/>
(WEB_BI_DEALER_ID,WEB_BI_DEALER_DS,QUARTER_ID,QUARTER_DS)
 SELECT
WEB_BI_DEALER_ID,WEB_BI_DEALER_DS,QUARTER_ID,QUARTER_DS  FROM decisyon_cache.DX170714970594101412@<AUTOMOTIVE_BI_DATA/>;




--\* Creazione tabella temporanea finale contenente valori distinti */
CREATE TABLE decisyon_cache.UX170714970594148013@<AUTOMOTIVE_BI_DATA/> AS SELECT DISTINCT
WEB_BI_DEALER_ID,WEB_BI_DEALER_DS,
QUARTER_ID,QUARTER_DS FROM decisyon_cache.UX170714970594126214@<AUTOMOTIVE_BI_DATA/>;




--\* Creazione del datamart finale */
CREATE TABLE decisyon_cache.FX170714970594147215@<AUTOMOTIVE_BI_DATA/> AS SELECT
   decisyon_cache.UX170714970594148013@<AUTOMOTIVE_BI_DATA/>.WEB_BI_DEALER_ID,decisyon_cache.UX170714970594148013@<AUTOMOTIVE_BI_DATA/>.WEB_BI_DEALER_DS,
   decisyon_cache.UX170714970594148013@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID,decisyon_cache.UX170714970594148013@<AUTOMOTIVE_BI_DATA/>.QUARTER_DS,
    NVL(WEB_BI_NETTORIGA_SUM_,0)  AS WEB_BI_NETTORIGA_SUM_,
    NVL(WEB_BI_IMPORTO_SUM_,0)  AS WEB_BI_IMPORTO_SUM_
FROM
   decisyon_cache.UX170714970594148013@<AUTOMOTIVE_BI_DATA/>
  left outer join decisyon_cache.DX170714970594138411@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX170714970594148013@<AUTOMOTIVE_BI_DATA/>.WEB_BI_DEALER_ID=decisyon_cache.DX170714970594138411@<AUTOMOTIVE_BI_DATA/>.WEB_BI_DEALER_ID AND
     decisyon_cache.UX170714970594148013@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX170714970594138411@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID)
  left outer join decisyon_cache.DX170714970594101412@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX170714970594148013@<AUTOMOTIVE_BI_DATA/>.WEB_BI_DEALER_ID=decisyon_cache.DX170714970594101412@<AUTOMOTIVE_BI_DATA/>.WEB_BI_DEALER_ID AND
     decisyon_cache.UX170714970594148013@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX170714970594101412@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID)
;
