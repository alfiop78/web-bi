



--\* Creazione tabella per il calcolo delle metriche:[web_bi_importo] */
CREATE TABLE decisyon_cache.DX171153310583783018@<AUTOMOTIVE_BI_DATA/> AS SELECT
   Obj_BUQuarter.id_Azienda as WEB_BI_DEALER_ID,Azienda628.descrizione as WEB_BI_DEALER_DS,
   Obj_BUQuarter.ID_QUARTER as QUARTER_ID,LK_QUARTER576.DSS_QUARTER as QUARTER_DS,
    NVL(SUM(Obj_BUQuarter.Importo),0)  AS WEB_BI_IMPORTO_SUM_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda628,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER576,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Obj_BUQuarter Obj_BUQuarter
 WHERE
   (   Obj_BUQuarter.ID_QUARTER IN ( 202303 , 202304 )  )
   AND   (   Obj_BUQuarter.id_Azienda = 437  )
   AND   Obj_BUQuarter.ID_QUARTER=LK_QUARTER576.ID_QUARTER
   AND   Obj_BUQuarter.id_Azienda=Azienda628.id
GROUP BY
   Obj_BUQuarter.id_Azienda,
   Azienda628.descrizione,
   Obj_BUQuarter.ID_QUARTER,
   LK_QUARTER576.DSS_QUARTER
;




--\* Creazione tabella per il calcolo delle metriche:[Nettoriga] */
CREATE TABLE decisyon_cache.DX171153310584911719@<AUTOMOTIVE_BI_DATA/> AS SELECT
   CodSedeDealer629.id_Azienda as WEB_BI_DEALER_ID,Azienda628.descrizione as WEB_BI_DEALER_DS,
   LK_MONTH575.ID_QUARTER as QUARTER_ID,LK_QUARTER576.DSS_QUARTER as QUARTER_DS,
    NVL(SUM(DocVenditaDettaglio.NettoRiga),0)  AS WEB_BI_NETTORIGA_SUM_
FROM
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.Azienda Azienda628,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.CodSedeDealer CodSedeDealer629,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaDettaglio DocVenditaDettaglio,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.DocVenditaIntestazione DocVenditaIntestazione,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_DATE LK_DATE,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_MONTH LK_MONTH575,
   automotive_bi_data@<AUTOMOTIVE_BI_DATA/>.LK_QUARTER LK_QUARTER576
 WHERE
   (   CodSedeDealer629.id_Azienda = 437  )
   AND   (   LK_MONTH575.ID_QUARTER IN ( 202303 , 202304 )  )
   AND   Azienda628.id=CodSedeDealer629.id_Azienda
   AND   CodSedeDealer629.id=DocVenditaIntestazione.id_CodSedeDealer
   AND   DocVenditaDettaglio.DataDocumento=LK_DATE.ID_DAY
   AND   DocVenditaDettaglio.NumRifInt=DocVenditaIntestazione.NumRifInt
   AND   DocVenditaDettaglio.id_Azienda=DocVenditaIntestazione.id_Azienda
   AND   LK_MONTH575.ID_MONTH=LK_DATE.ID_MONTH
   AND   LK_QUARTER576.ID_QUARTER=LK_MONTH575.ID_QUARTER
GROUP BY
   CodSedeDealer629.id_Azienda,
   Azienda628.descrizione,
   LK_MONTH575.ID_QUARTER,
   LK_QUARTER576.DSS_QUARTER
;




--\* Creazione tabella temporanea contenente i valori dimensionali */
CREATE TABLE decisyon_cache.UX171153310584963521@<AUTOMOTIVE_BI_DATA/> AS SELECT
 decisyon_cache.DX171153310583783018@<AUTOMOTIVE_BI_DATA/>.WEB_BI_DEALER_ID AS WEB_BI_DEALER_ID,decisyon_cache.DX171153310583783018@<AUTOMOTIVE_BI_DATA/>.WEB_BI_DEALER_DS AS WEB_BI_DEALER_DS,
 decisyon_cache.DX171153310583783018@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID AS QUARTER_ID,decisyon_cache.DX171153310583783018@<AUTOMOTIVE_BI_DATA/>.QUARTER_DS AS QUARTER_DS
FROM decisyon_cache.DX171153310583783018@<AUTOMOTIVE_BI_DATA/>;




--\* Inserimento in tabella temporanea */
INSERT INTO decisyon_cache.UX171153310584963521@<AUTOMOTIVE_BI_DATA/>
(WEB_BI_DEALER_ID,WEB_BI_DEALER_DS,QUARTER_ID,QUARTER_DS)
 SELECT
WEB_BI_DEALER_ID,WEB_BI_DEALER_DS,QUARTER_ID,QUARTER_DS  FROM decisyon_cache.DX171153310584911719@<AUTOMOTIVE_BI_DATA/>;




--\* Creazione tabella temporanea finale contenente valori distinti */
CREATE TABLE decisyon_cache.UX171153310584917220@<AUTOMOTIVE_BI_DATA/> AS SELECT DISTINCT
WEB_BI_DEALER_ID,WEB_BI_DEALER_DS,
QUARTER_ID,QUARTER_DS FROM decisyon_cache.UX171153310584963521@<AUTOMOTIVE_BI_DATA/>;




--\* Creazione del datamart finale */
CREATE TABLE decisyon_cache.FX171153310584927022@<AUTOMOTIVE_BI_DATA/> AS SELECT
   decisyon_cache.UX171153310584917220@<AUTOMOTIVE_BI_DATA/>.WEB_BI_DEALER_ID,decisyon_cache.UX171153310584917220@<AUTOMOTIVE_BI_DATA/>.WEB_BI_DEALER_DS,
   decisyon_cache.UX171153310584917220@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID,decisyon_cache.UX171153310584917220@<AUTOMOTIVE_BI_DATA/>.QUARTER_DS,
    NVL(WEB_BI_NETTORIGA_SUM_,0)  AS WEB_BI_NETTORIGA_SUM_,
    NVL(WEB_BI_IMPORTO_SUM_,0)  AS WEB_BI_IMPORTO_SUM_
FROM
   decisyon_cache.UX171153310584917220@<AUTOMOTIVE_BI_DATA/>
  left outer join decisyon_cache.DX171153310583783018@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX171153310584917220@<AUTOMOTIVE_BI_DATA/>.WEB_BI_DEALER_ID=decisyon_cache.DX171153310583783018@<AUTOMOTIVE_BI_DATA/>.WEB_BI_DEALER_ID AND
     decisyon_cache.UX171153310584917220@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX171153310583783018@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID)
  left outer join decisyon_cache.DX171153310584911719@<AUTOMOTIVE_BI_DATA/>  on (
     decisyon_cache.UX171153310584917220@<AUTOMOTIVE_BI_DATA/>.WEB_BI_DEALER_ID=decisyon_cache.DX171153310584911719@<AUTOMOTIVE_BI_DATA/>.WEB_BI_DEALER_ID AND
     decisyon_cache.UX171153310584917220@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID=decisyon_cache.DX171153310584911719@<AUTOMOTIVE_BI_DATA/>.QUARTER_ID)
;




--\* Ricerca CubeView:[web_bi_importo] */
;




--\* Ricerca CubeView:[Nettoriga] */
;
