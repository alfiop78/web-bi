# -*- coding: utf-8 -*-
"""
Created on Mon Mar 17 16:07:37 2025

@author: vitto
"""


import os

# current_file_path = os.path.abspath(__file__)
# print(current_file_path)


import time
start_time = time.time()

import pyodbc
# print(pyodbc.drivers())
import pandas as pd

import pymysql
from datetime import datetime


today = datetime.today().strftime('%y%m%d')
year = str(today[:2])
# print(year)
today = "1" + today
# print(today)

#%%

# import importlib.metadata

# packages = ['pandas', 'pymysql', 'pyodbc']

# for pkg in packages:
#     try:
#         version = importlib.metadata.version(pkg)
#         print(f"{pkg}: {version}")
#     except importlib.metadata.PackageNotFoundError:
#         print(f"{pkg}: not found")

#%%

# [ASP_14]
# Description = S06A03B4
# Driver = IBM i Access ODBC Driver 64-bit
# System = 192.168.1.31
# Password = php3452213
# UserID = PHPSERVICE
# Naming = 0
# DefaultLibraries = ,QGPL
# Database =
# ConnectionType = 2
# CommitMode = 2
# BlockFetch = 1
# BlockSizeKB = 512
# AllowDataCompression = 1


#%%

# to connect without the dsn connection
conn_str = (
    "DRIVER={IBM i Access ODBC Driver};"
    "SYSTEM=192.168.1.31;"
    "UID=PHPSERVICE;"
    "PWD=php3452213;"
    "NAMING=0;"
    "BLOCKFETCH=1;"
    "BLOCKSIZEKB=512;"
    "ALLOWDATACOMPRESSION=1;"
    "DEFAULTLIBRARY=QGPL;"
    "COMMITMODE=2;"
)

#%%


# Define connection parameters
dsn = "ibm_as400"  # Use the DSN name from your configuration
user = "PHPSERVICE"
password = "php3452213"

# Connection string
conn_str = f'DSN={dsn};UID={user};PWD={password};'

# Establish connection
try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    # print("Connection to AS/400 established successfully!")

    cursor.execute(f"SELECT * FROM VUEUGES.OTLAV02L where OTLIDI = '{today}' ")

    # Fetch and print results
    rows = cursor.fetchall()
    # for row in rows:
        # print(row)

    row_data = [list(row) for row in rows]



# for each matricola get last timbratura  of the day:
    # Get column names from cursor.description
    column_names = [
            "OTLANN", "OTLMAT", "OTLACO", "OTLTCO", "OTLNCO", "OTLINC",
            "OTLCOP", "OTLNRP", "OTLIDI", "OTLHOI", "OTLIDF", "OTLHOF",
            "OTLMAR", "OTLSED", "OTLFI1"
        ]


    # Convert to DataFrame
    df = pd.DataFrame(row_data, columns=column_names)


# join con matricole from automotive bi data 2.13 codMatricola operaio table
# then merge

    # Close the connection
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error connecting to AS/400: {e}")


#%%



db_connection_prod = {
        'user': 'vcastelnuovo',
        'password': 'ffe5W3EEss87',
        'host': '192.168.2.13',
        'database': 'automotive_bi_data'
    }


# print("Getting id Azienda")
db = pymysql.connect(**db_connection_prod)
cur = db.cursor()

# Construct parameterized query
query_matr = """
        select
            Codice as OTLMAT, Descrizione
        from
            automotive_bi_data.CodMatricolaOperaio
        where
            id_Azienda = 453; -- easycar

"""





# Execute the query
cur.execute(query_matr)
mats = cur.fetchall()
cols = [desc[0] for desc in cur.description]

# matricole  = pd.DataFrame(mats, columns=cols)
matricole = pd.DataFrame(list(mats), columns=cols)



# Close connection
if db_connection_prod:
    cur.close()
    db.close()

# print("Database connection closed.")
#%%
# print(df['OTLMAT'].dtype, matricole['OTLMAT'].dtype)  # Check data t

# matricole = matricole[~matricole['Descrizione'].astype(str).str.contains("Non Codificato", na=False)]
# matricole = matricole[~matricole['Descrizione'].astype(str).str.contains("Non codificato", na=False)]


# per ogni matr get two rows the last one that is 00 and the one before that was just recently closed
# Remove leading zeros from a specific column (e.g., 'my_column')
df['OTLMAT'] = df['OTLMAT'].astype(str).str.lstrip('0')
matricole['OTLMAT'] = matricole['OTLMAT'].astype(str).str.lstrip('0')



df = df.merge(matricole, on='OTLMAT', how='left')




# 1️ Get rows where both 'OTLIDF' and 'OTLHOI' are 0
df_zeros = df[(df['OTLIDF'] == 0) & (df['OTLHOF'] == 0)]

# 2️ Get all other rows (where 'OTLIDF' and 'OTLHOI' are NOT both 0)
df_non_zeros = df[~((df['OTLIDF'] == 0) & (df['OTLHOF'] == 0))]
df_non_zeros = df_non_zeros.groupby('OTLMAT').last().reset_index()

df_combined = pd.concat([df_non_zeros, df_zeros], ignore_index=True)

#%%
# calculating the updated column and adding it to the df

now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
df_combined['updated'] = now



new_order = ['OTLMAT', 'OTLANN', 'OTLACO',
             'OTLTCO', 'OTLNCO', 'OTLINC',
             'OTLCOP', 'OTLNRP', 'OTLIDI',
             'OTLHOI', 'OTLIDF', 'OTLHOF',
             'OTLMAR', 'OTLSED', 'OTLFI1',
             'Descrizione', 'updated']
df_combined = df_combined[new_order]

#%% adding telaio, targa e nome cliente from another as400 table



# Establish connection
try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    # print("Connection to AS/400 established successfully!")

    cursor.execute(f"SELECT * FROM VUEUGES.MFTTE00F where MNMCOM LIKE '{year}%'")

    # Fetch and print results
    rows = cursor.fetchall()
    # for row in rows:
    #     print(row)

    row_data = [list(row) for row in rows]



# for each matricola get last timbratura  of the day:
    # Get column names from cursor.description
    column_names = [

    'MNMRII', 'MCDCLI', 'MRAGS1', 'MRAGS2', 'MFILL7', 'MPROVI', 'MCOAVP', 'MCDFIS', 'MTPMOV', 'MCDSED',
    'MMAGDE', 'MFLTPD', 'MIDAP7', 'MNMBFO', 'MIDBFO', 'MAUTOR', 'MNMORD', 'MIDORD', 'MCDAGE', 'MDEPAG',
    'MIMX01', 'MIMX02', 'MIMX03', 'MIVX01', 'MIVX02', 'MIVX03', 'MCDVA1', 'MFLFTD', 'MDEFER', 'MAPSTA',
    'MTPNUD', 'MNMNUD', 'MTPNUM', 'MNMFIS', 'MIDDOD', 'MIDDOC', 'MCDZON', 'MCAUIN', 'MCDCCI', 'MFLTRC',
    'MFLSRB', 'MTODOP', 'MFILL8', 'MCDPAG', 'MTMNUM', 'MFLSDF', 'MFLIVS', 'MTMNUD', 'MPESOK', 'MCDOPE',
    'MSTAVC', 'MNTELA', 'MNMTAR', 'MFILL9', 'MALX01', 'MALX02', 'MALX03', 'MMYEAR', 'MFILL2', 'MCDVEI',
    'MFILL4', 'MCLSCO', 'MNMCOM', 'MFLTSR', 'MFLLQD', 'MASSFI', 'MCENRI', 'MNMMOT', 'MNMSRE', 'MCNTKM',
    'MIDTIG', 'MCENVE', 'MFLPSR', 'MFILL6', 'MCLIXR', 'MNMBUO', 'MCDMAR', 'MSCCLF', 'MTPCLI', 'MIDAPC',
    'MFLTRP', 'MNMPRM', 'MFLTRU', 'MCSERF', 'MCSEFD', 'MCSRFD', 'MDTCOP', 'MORCOP', 'MLVCRB', 'MCDMVE',
    'MMODCO', 'MANNUL', 'MINDIR', 'MLOCAL', 'MNTLF1', 'MNTLF2', 'MEMAIL', 'MTPVEI', 'MFLSTK', 'MTOBOP',
    'MCDPOR', 'MCAUTR', 'MTRACU', 'MASPBE', 'MNMCOL', 'MDTITR', 'MORITR', 'MTARAI', 'MCNODV', 'MCCLDV',
    'MCNOVE', 'MCFOVE', 'MPAIVA', 'MCNAZI', 'MNAZIO', 'MKVTPI', 'MKVCMC', 'MKVNMR', 'MUMUSR', 'MUMWST',
    'MUMDAT', 'MUMORA', 'MDSEXT'
        ]


    # Convert to DataFrame
    df2 = pd.DataFrame(row_data, columns=column_names)

    selected_columns = ['MNMCOM', 'MRAGS1','MNTELA', 'MNMTAR']
    df2 = df2[selected_columns]


# join con matricole from automotive bi data 2.13 codMatricola operaio table
# then merge

    # Close the connection
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error connecting to AS/400: {e}")



#%%
# annoCommessa,tipoCommessa, numeroCommessa

df_combined['MNMCOM'] = df_combined['OTLACO'].astype(str) + df_combined['OTLTCO'].astype(str) + df_combined['OTLNCO'] .astype(str)



df_combined = pd.merge(
    df_combined,
    df2,
    on="MNMCOM",
    how="left"
)

end_time = time.time()
execution_time = end_time - start_time

# print(f"Execution time: {execution_time:.2f} seconds")

#%% delete all rows in db and then insert the new df

# start_time = time.time()


db_connection_test = {
        'user': 'vcastelnuovo',
        'password': 'ffe5W3EEss87',
        'host': '192.168.2.7',
        'database': 'automotive_bi_data'
    }
#DELETE DATE INVOICE RANGE BEFORE INSERTING NEW DATA
# print("deleting all rows in table TimbratureLavoriOperai")
db = pymysql.connect(**db_connection_test)
cur = db.cursor()


# Construct parameterized query
query_delete = """
                DELETE FROM automotive_bi_data.Timbrature_Lavori_Operai;
    """

# Execute the query
cur.execute(query_delete)
db.commit()
# print('Deleting rows...')


if db_connection_test:
        cur.close()
        db.close()

# print("Database connection closed.")

#%%
# inserting df information into table timbratureLavoriOperai


# print("INSERTING INTO DATABASE...")
db = pymysql.connect(**db_connection_test)
cur = db.cursor()



# Insert rows into the table
rows_inserted = 0

# new_df = new_df.fillna('')
for index, row in df_combined.iterrows():




    matr = row['OTLMAT']
    annul = row['OTLANN']
    aco = row['OTLACO']
    tco = row['OTLTCO']
    nco = row['OTLNCO']

    inc = row['OTLINC']
    cop = row['OTLCOP']
    nrp = row['OTLNRP']
    dinit = row['OTLIDI']
    oinit = row['OTLHOI']

    dfin = row['OTLIDF']
    ofin = row['OTLHOF']
    marca = row['OTLMAR']
    sed = row['OTLSED']
    filler = row['OTLFI1']

    descr = row['Descrizione']
    updat = row['updated']

    nomcli = row['MRAGS1']
    plate = row['MNMTAR']
    vin = row['MNTELA']

    # Construct parameterized query
    query_insert = """
        INSERT INTO automotive_bi_data.Timbrature_Lavori_Operai (

                codiceMatricola,
                annullo,
                annoCommessa,
                tipoCommessa,
                numeroCommessa,
                inconvente,
                codiceOperazione,
                numRigaProgress,
                dataInizioLavoro,
                oraInizioLavoro,
                dataFineLavoro,
                oraFineLavoro,
                codiceMarca,
                codiceSede,
                filler,
                operaio,
                updated,
                nomeCliente,
                targa,
                telaio

            )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """
    values = (matr, annul, aco, tco, nco,
        inc, cop, nrp, dinit, oinit,
        dfin, ofin, marca, sed, filler,
        descr, updat,
        nomcli, plate, vin
)


    # Execute the query
    cur.execute(query_insert, values)
    db.commit()
    rows_inserted += 1
    # print('Inserting rows...')

# print(f"Inserted {rows_inserted} rows")

    # Close connection
if db_connection_test:
        cur.close()
        db.close()

# print("Database connection closed.")




