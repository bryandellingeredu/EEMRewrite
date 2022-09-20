using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Domain;
using Azure.Core;

namespace Application.Core
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<Activity, Activity>()
                .ForMember(x => x.Start,
                  opt => opt.MapFrom(src => TimeZone.CurrentTimeZone.ToLocalTime(src.Start)))
                .ForMember(x => x.End,
                  opt => opt.MapFrom(src => TimeZone.CurrentTimeZone.ToLocalTime(src.End)))
                .ForMember(x => x.Category, opt => opt.MapFrom<Category>(_ => null));
        }
    }
}
