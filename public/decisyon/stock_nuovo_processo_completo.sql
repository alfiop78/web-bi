



--\* Creazione tabella per il calcolo delle metriche:[Totalefa, idRecord] */
CREATE TABLE decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/> ENGINE=InnoDB AS SELECT 
   VeicoloNuovo.Telaio as CONTR_TELAIO_ID,VeicoloNuovo.Telaio as CONTR_TELAIO_DS,
   CodSedeDealer3.id as DSSEDE_ID,CodSedeDealer3.Descrizione as DSSEDE_DS,
   VeicoloNuovo.id_CodUbicazioneVeicolo as CONTR_UBICAZIONE_ID,CodUbicazioneVeicolo25.Descrizione as CONTR_UBICAZIONE_DS,
   VeicoloNuovo.DtFattAcq as CONTR_DT_FATTACQ_ID,VeicoloNuovo.DtFattAcq as CONTR_DT_FATTACQ_DS,
   VeicoloNuovo.DtContrattoVendita as CONTR_DTCONTRATTOVENDITA_ID,date_format(DtContrattoVendita, '%d-%m-%Y') as CONTR_DTCONTRATTOVENDITA_DS,
   VeicoloNuovo.DtArrivo as CONTR_DTARRIVO_FORMAT_ID, date_format ( VeicoloNuovo.DtArrivo , '%d-%m-%Y' )  as CONTR_DTARRIVO_FORMAT_DS,
   VeicoloNuovo.DtFattVendita as CONTR_DTFATTVENDITA_ID,   date_format ( VeicoloNuovo.DtFattVendita , '%d-%m-%Y' )  as CONTR_DTFATTVENDITA_DS,
   CodModello19.Codice as CONTR_CODMODEL2_ID,CodModello19.Codice as CONTR_CODMODEL2_DS,
   CodVeicoloOgniMarca38.Codice as CVM_CODICE_ID,CodVeicoloOgniMarca38.Codice as CVM_CODICE_DS,
   CodVeicoloOgniMarca13.id as CONTR_DESCR_VEICOLO_ID,CodVeicoloOgniMarca13.Descrizione as CONTR_DESCR_VEICOLO_DS,
   Fornitori40.id as VEND_COGNOME_ID,Fornitori40.CognomeORagSociale as VEND_COGNOME_DS,
   VeicoloNuovo.NumOrdineFab as CONTR_NUMORDINEFAB_ID,VeicoloNuovo.NumOrdineFab as CONTR_NUMORDINEFAB_DS,
   VeicoloNuovo.NrContrattoVendita as CONTR_NRCONTRATTOVENDITA_ID,VeicoloNuovo.NrContrattoVendita as CONTR_NRCONTRATTOVENDITA_DS,
   CodColoriEsterniVeicolo23.id as CONTR_COL_EST_ID_ID,CodColoriEsterniVeicolo23.Descrizione as CONTR_COL_EST_ID_DS,
   VeicoloNuovo.id_CodColoriInterniVeicolo as CONTR_COL_INT_DES_ID,CodColoriInterniVeicolo24.Descrizione as CONTR_COL_INT_DES_DS,
      concat ( 'NUO' , '_' , VeicoloNuovo.id_Azienda , '_' , VeicoloNuovo.MarcaConcessionaria , '_' , VeicoloNuovo.IdProgressivo )  as IDCUSTOMRECORD_ID,   concat ( 'NUO' , '_' , VeicoloNuovo.id_Azienda , '_' , VeicoloNuovo.MarcaConcessionaria , '_' , VeicoloNuovo.IdProgressivo )  as IDCUSTOMRECORD_DS,
   VeicoloNuovo.NumeroTarga as CONTR_TARGA_ID,VeicoloNuovo.NumeroTarga as CONTR_TARGA_DS,
   VeicoloNuovo.DtConsCliente as CONTR_DT_CONSCLIENTE_ID,VeicoloNuovo.DtConsCliente as CONTR_DT_CONSCLIENTE_DS,
   ClientiFornitori1.CodiceCliFor as ACQ_COD_CLI_FOR_ID,ClientiFornitori1.CodiceCliFor as ACQ_COD_CLI_FOR_DS,
   ClientiFornitori1.id as ACQ_CLIENTE_ID,ClientiFornitori1.Descrizione as ACQ_CLIENTE_DS,
   VeicoloNuovo.IdProgressivo as CONTR_IDPROGRESSIVO_ID,VeicoloNuovo.IdProgressivo as CONTR_IDPROGRESSIVO_DS,
   VeicoloNuovo.MarcaConcessionaria as CONTR_MARCA_CONC_ID,VeicoloNuovo.MarcaConcessionaria as CONTR_MARCA_CONC_DS,
   VeicoloNuovo.NumFatAcqCasaM as CONTR_NUM_FATACQCASAM_ID,VeicoloNuovo.NumFatAcqCasaM as CONTR_NUM_FATACQCASAM_DS,
   VeicoloNuovo.NumFattAcq as CONTR_NUMFATTACQ_ID,VeicoloNuovo.NumFattAcq as CONTR_NUMFATTACQ_DS,
   VeicoloNuovoOptionals39.Descrizione as VNOPT_DESCRIZIONE_ID,VeicoloNuovoOptionals39.Descrizione as VNOPT_DESCRIZIONE_DS,
   CodZonaVendita6.id as ZONA_VENDITA_ID,CodZonaVendita6.Descrizione as ZONA_VENDITA_DS,
   VeicoloNuovo.id as CONTR_ID_ID,VeicoloNuovo.id as CONTR_ID_DS,
   CodSedeDealer3.id_Azienda as COM_AZIENDA_ID,concat( left(Azienda2.CodDealerCM,3), ' ' ,  Azienda2.descrizione  ) as COM_AZIENDA_DS,
   VeicoloNuovo.id_CodMarcaVeicolo as CONTR_MARCA_V_ID,CodMarcaVeicolo21.Descrizione as CONTR_MARCA_V_DS,
   CodModello19.id as CONTR_COD_MODELLO_ID,CodModello19.Descrizione as CONTR_COD_MODELLO_DS,
   CodVeicoloOgniMarca13.CodiceSettore as CONTR_CODICESETTORE_ID,CodVeicoloOgniMarca13.CodiceSettore as CONTR_CODICESETTORE_DS,
   CodCanaleVenditaVeicolo20.id as CONTR_COD_CANALE_V_ID,CodCanaleVenditaVeicolo20.Codice as CONTR_COD_CANALE_V_DS,
   CodCanaleVenditaVeicolo20.Descrizione as CONTR_DESCR_CANALE_V_ID,CodCanaleVenditaVeicolo20.Descrizione as CONTR_DESCR_CANALE_V_DS,
   CodStatoOrdVeicolo30.Codice as CODSTORDINE_ID,CodStatoOrdVeicolo30.Codice as CODSTORDINE_DS,
   CodStatoOrdVeicolo30.id as STORDINE_ID,CodStatoOrdVeicolo30.Descrizione as STORDINE_DS,
   VeicoloNuovo.ImpFtAcqVN as CONTR_IMPFTACQVN_ID,VeicoloNuovo.ImpFtAcqVN as CONTR_IMPFTACQVN_DS,
   VeicoloNuovo.ImpFtAcqVN as IMPFTACQVN_ID,VeicoloNuovo.ImpFtAcqVN as IMPFTACQVN_DS,
   VeicoloNuovo.DtFattAcq as CONTR_DTFATTACQ_GIACENZA_ID, if ( VeicoloNuovo.DtFattAcq <> 0 , datediff ( date_format ( current_date (), '%Y-%m-%d' ), date_format ( VeicoloNuovo.DtFattAcq , '%Y-%m-%d' ))  , null )  as CONTR_DTFATTACQ_GIACENZA_DS,
   VeicoloNuovo.DtOrdine as CONTR_DTORDINE_ID,VeicoloNuovo.DtOrdine as CONTR_DTORDINE_DS,
   VeicoloNuovo.DtAssegnaz as CONTR_DT_ASSEGNAZ_ID,date_format( VeicoloNuovo.DtAssegnaz , '%d-%m-%Y') as CONTR_DT_ASSEGNAZ_DS,
   VeicoloNuovo.updated as UPDATED_ID,VeicoloNuovo.updated as UPDATED_DS,
   VeicoloNuovo.UtenteUltimaManut as UTENTEULTIMAMANUT_ID,VeicoloNuovo.UtenteUltimaManut as UTENTEULTIMAMANUT_DS,
    IFNULL(SUM(VeicoloNuovo.TotaleFA),0)  AS TOTALEFA_SUM_,
    IFNULL(COUNT(VeicoloNuovo.id),0)  AS IDRECORD_
FROM 
   automotive_bi_data@<DECISYON_DATA_V6/>.Azienda Azienda2,
   automotive_bi_data@<DECISYON_DATA_V6/>.ClientiFornitori ClientiFornitori1,
   automotive_bi_data@<DECISYON_DATA_V6/>.CodCanaleVenditaVeicolo CodCanaleVenditaVeicolo20,
   automotive_bi_data@<DECISYON_DATA_V6/>.CodColoriEsterniVeicolo CodColoriEsterniVeicolo23,
   automotive_bi_data@<DECISYON_DATA_V6/>.CodColoriInterniVeicolo CodColoriInterniVeicolo24,
   automotive_bi_data@<DECISYON_DATA_V6/>.CodMarcaVeicolo CodMarcaVeicolo21,
   automotive_bi_data@<DECISYON_DATA_V6/>.CodModello CodModello19,
   automotive_bi_data@<DECISYON_DATA_V6/>.CodSedeDealer CodSedeDealer3,
   automotive_bi_data@<DECISYON_DATA_V6/>.CodStatoOrdVeicolo CodStatoOrdVeicolo30,
   automotive_bi_data@<DECISYON_DATA_V6/>.CodUbicazioneVeicolo CodUbicazioneVeicolo25,
   automotive_bi_data@<DECISYON_DATA_V6/>.CodVeicoloOgniMarca CodVeicoloOgniMarca13,
   automotive_bi_data@<DECISYON_DATA_V6/>.CodVeicoloOgniMarca CodVeicoloOgniMarca38,
   automotive_bi_data@<DECISYON_DATA_V6/>.CodZonaVendita CodZonaVendita6,
   automotive_bi_data@<DECISYON_DATA_V6/>.Fornitori Fornitori40,
   automotive_bi_data@<DECISYON_DATA_V6/>.VeicoloNuovo VeicoloNuovo,
   automotive_bi_data@<DECISYON_DATA_V6/>.VeicoloNuovoOptionals VeicoloNuovoOptionals39
 WHERE 
   (        VeicoloNuovo.Annullato <> 'A'  )
   AND   (       VeicoloNuovo.DtImmatricol  = '0' and VeicoloNuovo.DtFattVendita = '0'  )
   AND   (       VeicoloNuovo.DtStornoCess = 0  )
   AND   (     CodSedeDealer3.id <> '1558'  )
   AND   (   CodCanaleVenditaVeicolo20.IsCessioneAltroConcess is null  )
   AND   (   CodSedeDealer3.id_Azienda   IN ( 473 , 43 , 437 , 1000002287 , 452 , 445 , 452 , 5209 , 511 , 1000001927 , 481 , 453   ) )
   AND   (   CodStatoOrdVeicolo30.VisualizzaInStock = 1  )
   AND   (   VeicoloNuovoOptionals39.Codice IN( '*ALL' , '*NO' ) )
   AND   Azienda2.id=CodSedeDealer3.id_Azienda
   AND   CodCanaleVenditaVeicolo20.id=VeicoloNuovo.id_CodCanaleVenditaVeicolo
   AND   CodCanaleVenditaVeicolo20.id_Azienda=VeicoloNuovo.id_Azienda
   AND   CodColoriEsterniVeicolo23.id=VeicoloNuovo.id_CodColoriEsterniVeicolo
   AND   CodColoriEsterniVeicolo23.id_Azienda=VeicoloNuovo.id_Azienda
   AND   CodColoriInterniVeicolo24.id=VeicoloNuovo.id_CodColoriInterniVeicolo
   AND   CodMarcaVeicolo21.id=VeicoloNuovo.id_CodMarcaVeicolo
   AND   CodModello19.id=VeicoloNuovo.id_ModelloCommerciale
   AND   CodModello19.id_Azienda=VeicoloNuovo.id_Azienda
   AND   CodUbicazioneVeicolo25.id=VeicoloNuovo.id_CodUbicazioneVeicolo
   AND   VeicoloNuovo.id=VeicoloNuovoOptionals39.id_VeicoloNuovo
   AND   VeicoloNuovo.id_Azienda=ClientiFornitori1.id_Azienda
   AND   VeicoloNuovo.id_Azienda=CodSedeDealer3.id_Azienda
   AND   VeicoloNuovo.id_Azienda=CodStatoOrdVeicolo30.id_Azienda
   AND   VeicoloNuovo.id_Azienda=CodVeicoloOgniMarca13.id_Azienda
   AND   VeicoloNuovo.id_Azienda=CodVeicoloOgniMarca38.id_Azienda
   AND   VeicoloNuovo.id_Azienda=CodZonaVendita6.id_Azienda
   AND   VeicoloNuovo.id_Azienda=Fornitori40.id_Azienda
   AND   VeicoloNuovo.id_CdAcquirente=ClientiFornitori1.id
   AND   VeicoloNuovo.id_CdVenditore=Fornitori40.id
   AND   VeicoloNuovo.id_CodSedeDealer=CodSedeDealer3.id
   AND   VeicoloNuovo.id_CodStatoOrdVeicolo=CodStatoOrdVeicolo30.id
   AND   VeicoloNuovo.id_CodVeicoloOgniMarca=CodVeicoloOgniMarca13.id
   AND   VeicoloNuovo.id_CodVeicoloOgniMarca=CodVeicoloOgniMarca38.id
   AND   VeicoloNuovo.id_CodZonaVendita=CodZonaVendita6.id
GROUP BY 
   VeicoloNuovo.Telaio,
   CodSedeDealer3.id,
   CodSedeDealer3.Descrizione,
   VeicoloNuovo.id_CodUbicazioneVeicolo,
   CodUbicazioneVeicolo25.Descrizione,
   VeicoloNuovo.DtFattAcq,
   VeicoloNuovo.DtContrattoVendita,
   date_format(DtContrattoVendita, '%d-%m-%Y'),
   VeicoloNuovo.DtArrivo,
    date_format ( VeicoloNuovo.DtArrivo , '%d-%m-%Y' ) ,
   VeicoloNuovo.DtFattVendita,
      date_format ( VeicoloNuovo.DtFattVendita , '%d-%m-%Y' ) ,
   CodModello19.Codice,
   CodVeicoloOgniMarca38.Codice,
   CodVeicoloOgniMarca13.id,
   CodVeicoloOgniMarca13.Descrizione,
   Fornitori40.id,
   Fornitori40.CognomeORagSociale,
   VeicoloNuovo.NumOrdineFab,
   VeicoloNuovo.NrContrattoVendita,
   CodColoriEsterniVeicolo23.id,
   CodColoriEsterniVeicolo23.Descrizione,
   VeicoloNuovo.id_CodColoriInterniVeicolo,
   CodColoriInterniVeicolo24.Descrizione,
      concat ( 'NUO' , '_' , VeicoloNuovo.id_Azienda , '_' , VeicoloNuovo.MarcaConcessionaria , '_' , VeicoloNuovo.IdProgressivo ) ,
   VeicoloNuovo.NumeroTarga,
   VeicoloNuovo.DtConsCliente,
   ClientiFornitori1.CodiceCliFor,
   ClientiFornitori1.id,
   ClientiFornitori1.Descrizione,
   VeicoloNuovo.IdProgressivo,
   VeicoloNuovo.MarcaConcessionaria,
   VeicoloNuovo.NumFatAcqCasaM,
   VeicoloNuovo.NumFattAcq,
   VeicoloNuovoOptionals39.Descrizione,
   CodZonaVendita6.id,
   CodZonaVendita6.Descrizione,
   VeicoloNuovo.id,
   CodSedeDealer3.id_Azienda,
   concat( left(Azienda2.CodDealerCM,3), ' ' ,  Azienda2.descrizione  ),
   VeicoloNuovo.id_CodMarcaVeicolo,
   CodMarcaVeicolo21.Descrizione,
   CodModello19.id,
   CodModello19.Descrizione,
   CodVeicoloOgniMarca13.CodiceSettore,
   CodCanaleVenditaVeicolo20.id,
   CodCanaleVenditaVeicolo20.Codice,
   CodCanaleVenditaVeicolo20.Descrizione,
   CodStatoOrdVeicolo30.Codice,
   CodStatoOrdVeicolo30.id,
   CodStatoOrdVeicolo30.Descrizione,
   VeicoloNuovo.ImpFtAcqVN,
    if ( VeicoloNuovo.DtFattAcq <> 0 , datediff ( date_format ( current_date (), '%Y-%m-%d' ), date_format ( VeicoloNuovo.DtFattAcq , '%Y-%m-%d' ))  , null ) ,
   VeicoloNuovo.DtOrdine,
   VeicoloNuovo.DtAssegnaz,
   date_format( VeicoloNuovo.DtAssegnaz , '%d-%m-%Y'),
   VeicoloNuovo.updated,
   VeicoloNuovo.UtenteUltimaManut
;




--\* Creazione del datamart finale */
CREATE TABLE decisyon_cache_v6_prod.FX16877739381143274@<DECISYON_DATA_V6/> ENGINE=InnoDB AS SELECT 
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_TELAIO_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_TELAIO_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.DSSEDE_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.DSSEDE_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_UBICAZIONE_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_UBICAZIONE_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DT_FATTACQ_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DT_FATTACQ_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DTCONTRATTOVENDITA_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DTCONTRATTOVENDITA_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DTARRIVO_FORMAT_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DTARRIVO_FORMAT_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DTFATTVENDITA_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DTFATTVENDITA_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_CODMODEL2_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_CODMODEL2_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CVM_CODICE_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CVM_CODICE_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DESCR_VEICOLO_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DESCR_VEICOLO_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.VEND_COGNOME_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.VEND_COGNOME_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_NUMORDINEFAB_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_NUMORDINEFAB_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_NRCONTRATTOVENDITA_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_NRCONTRATTOVENDITA_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_COL_EST_ID_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_COL_EST_ID_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_COL_INT_DES_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_COL_INT_DES_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.IDCUSTOMRECORD_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.IDCUSTOMRECORD_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_TARGA_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_TARGA_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DT_CONSCLIENTE_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DT_CONSCLIENTE_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.ACQ_COD_CLI_FOR_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.ACQ_COD_CLI_FOR_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.ACQ_CLIENTE_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.ACQ_CLIENTE_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_IDPROGRESSIVO_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_IDPROGRESSIVO_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_MARCA_CONC_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_MARCA_CONC_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_NUM_FATACQCASAM_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_NUM_FATACQCASAM_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_NUMFATTACQ_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_NUMFATTACQ_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.VNOPT_DESCRIZIONE_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.VNOPT_DESCRIZIONE_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.ZONA_VENDITA_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.ZONA_VENDITA_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_ID_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_ID_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.COM_AZIENDA_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.COM_AZIENDA_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_MARCA_V_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_MARCA_V_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_COD_MODELLO_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_COD_MODELLO_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_CODICESETTORE_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_CODICESETTORE_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_COD_CANALE_V_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_COD_CANALE_V_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DESCR_CANALE_V_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DESCR_CANALE_V_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CODSTORDINE_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CODSTORDINE_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.STORDINE_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.STORDINE_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_IMPFTACQVN_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_IMPFTACQVN_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.IMPFTACQVN_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.IMPFTACQVN_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DTFATTACQ_GIACENZA_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DTFATTACQ_GIACENZA_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DTORDINE_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DTORDINE_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DT_ASSEGNAZ_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.CONTR_DT_ASSEGNAZ_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.UPDATED_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.UPDATED_DS,
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.UTENTEULTIMAMANUT_ID,decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>.UTENTEULTIMAMANUT_DS,
    IFNULL(IDRECORD_,0)  AS IDRECORD_,
    IFNULL(TOTALEFA_SUM_,0)  AS TOTALEFA_SUM_
FROM 
   decisyon_cache_v6_prod.DX16877739380907401@<DECISYON_DATA_V6/>
;




--\* Ricerca CubeView:[Totalefa, idRecord] */
;




--\* Ricerca CubeView:[idRecord] */
;

