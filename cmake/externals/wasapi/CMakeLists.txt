if (WIN32)

  set(EXTERNAL_NAME wasapi)
  string(TOUPPER ${EXTERNAL_NAME} EXTERNAL_NAME_UPPER)
    
  include(ExternalProject)
  ExternalProject_Add(
    ${EXTERNAL_NAME}
    URL http://hifi-public.s3.amazonaws.com/dependencies/qtaudio_wasapi3.zip
    URL_MD5 1a2433f80a788a54c70f505ff4f43ac1
    CONFIGURE_COMMAND ""
    BUILD_COMMAND ""
    INSTALL_COMMAND ""
    LOG_DOWNLOAD 1
  )
    
  # Hide this external target (for ide users)
  set_target_properties(${EXTERNAL_NAME} PROPERTIES FOLDER "hidden/externals")
    
  ExternalProject_Get_Property(${EXTERNAL_NAME} SOURCE_DIR)
    
  set(${EXTERNAL_NAME_UPPER}_DLL_PATH ${SOURCE_DIR} CACHE FILEPATH "Location of wasapi DLL")

endif()
